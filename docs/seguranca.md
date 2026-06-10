# 🔒 Segurança — AgroSat

Documento da frente de Segurança. Cobre o que está implementado no backend e o
desenho da evolução para JWT.

Entregáveis do desafio atendidos:
- **Sistema de login com senha criptografada** -> `POST /api/auth/login` valida por hash SHA-256.
- **Pelo menos 2 práticas de segurança** -> validação de entrada, criptografia de senha, proteção contra SQLi e CORS controlado (4 práticas).

---

## 1. Login com senha criptografada

Fluxo implementado, sem dependência de JWT/Spring Security:

```
POST /api/auth/login   { "email": "...", "senha": "..." }
        │
        ▼
ProdutorService.autenticar():
  1. busca o produtor por email
  2. aplica o MESMO hash SHA-256 na senha enviada
  3. compara o digest com produtores.senha_hash
        │
        ├── confere   -> 200 OK + dados do produtor (sem o hash)
        └── não confere -> 401 Unauthorized (genérico)
```

Pontos de segurança do login:

- A senha nunca trafega nem é comparada em texto puro; comparamos hashes.
- O `ProdutorResponse` não expõe `senha_hash`.
- A resposta 401 é genérica para email inexistente e senha errada, para não
  revelar quais emails existem na base (evita enumeração de usuários).

Arquivos: `dto/LoginRequest.java`, `controller/AuthController.java`,
`service/ProdutorService.java` (método `autenticar`), `repository/ProdutorRepository.java`
(método `findByEmail`).

---

## 2. Práticas de segurança aplicadas

| Prática | Onde | Como |
|---|---|---|
| **Criptografia de senha** | `service/ProdutorService.java` | SHA-256 com `MessageDigest`, salvo só o digest em `produtores.senha_hash` |
| **Validação de entrada** | DTOs (`*Request`) + controllers | Bean Validation (`@NotBlank`, `@Email`, `@Size`, `@NotNull`) com `@Valid` |
| **Proteção contra SQL Injection** | toda a camada de persistência | Spring Data JPA / Hibernate usa *prepared statements* parametrizados; não há concatenação de SQL com input do usuário |
| **CORS controlado** | `config/SecurityConfig.java` | `WebMvcConfigurer` libera apenas `/api/**` para o app mobile |
| **Erros padronizados** | `config/GlobalExceptionHandler.java` | `@RestControllerAdvice` retornando `ProblemDetail` (RFC 9457), sem vazar stack trace |

### Ressalva honesta sobre o hash

SHA-256 puro atende a prova de conceito, mas tem limitação real: é rápido demais
e não usa *salt*, então fica exposto a rainbow tables e força bruta por GPU. Em
produção o recomendado é um algoritmo lento e com salt: **BCrypt** (mais simples
no ecossistema Spring) ou **Argon2**. A migração entra junto do Spring Security
(item 3), trocando o hash manual pelo `BCryptPasswordEncoder`.

---

## 3. Autenticação JWT (evolução projetada)

O login atual identifica o usuário, mas não emite token de sessão. O passo
seguinte é JWT *stateless*. Não há `spring-boot-starter-security` no `pom.xml`
ainda, então ele entra junto da biblioteca de JWT.

### 3.1 Dependências

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<!-- jjwt-impl e jjwt-jackson em runtime -->
```

### 3.2 Fluxo

```
1. POST /api/auth/login  -> além de validar, devolve um JWT assinado (HMAC-SHA256)
2. App guarda o token e envia: Authorization: Bearer <token>
3. JwtAuthFilter (OncePerRequestFilter) valida assinatura + expiração
   e popula o SecurityContext
4. Endpoints /api/** exigem autenticação; /api/auth/**, /swagger-ui e /h2-console ficam públicos
```

### 3.3 Componentes a criar

**`JwtService`** — gera e valida o token:

```java
@Service
public class JwtService {
    private final SecretKey chave = Keys.hmacShaKeyFor(SEGREDO.getBytes());
    private static final long EXPIRACAO_MS = 1000 * 60 * 60; // 1h

    public String gerarToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRACAO_MS))
                .signWith(chave)
                .compact();
    }

    public String extrairEmail(String token) {
        return Jwts.parser().verifyWith(chave).build()
                .parseSignedClaims(token).getPayload().getSubject();
    }
}
```

**`JwtAuthFilter extends OncePerRequestFilter`** — lê o header `Authorization`,
valida o token e autentica a requisição no `SecurityContextHolder`.

**`SecurityConfig`** — passaria de `WebMvcConfigurer` (só CORS) para um
`SecurityFilterChain`, mantendo o CORS e adicionando as regras:

```java
@Bean
SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtFilter) throws Exception {
    http
        .csrf(csrf -> csrf.disable())                  // API stateless, sem cookie de sessão
        .cors(Customizer.withDefaults())
        .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**", "/swagger-ui/**", "/api-docs/**", "/h2-console/**").permitAll()
            .anyRequest().authenticated())
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
}

@Bean
PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(); // substitui o SHA-256 manual
}
```

### 3.4 Boas práticas do desenho

- Segredo do JWT fora do código, em variável de ambiente (`JWT_SECRET`).
- Token de curta duração (1h) e, se necessário, *refresh token* separado.
- `csrf` desabilitado é correto aqui: API stateless, sem cookies; o token vai no header.
- Em produção, trocar `allowedOrigins("*")` pela origem real do app.

---

## 4. Resumo para a apresentação

> O AgroSat tem login com senha criptografada (SHA-256, nunca em texto puro),
> validação de entrada em todos os endpoints, proteção contra SQL Injection via
> consultas parametrizadas do JPA, CORS restrito ao app e erros padronizados
> (ProblemDetail / RFC 9457). A evolução para JWT está desenhada ponta a ponta:
> o login emite o token, um filtro o valida em cada requisição e o
> SecurityFilterChain libera só as rotas públicas.
