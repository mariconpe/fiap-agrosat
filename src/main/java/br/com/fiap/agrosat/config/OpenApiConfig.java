package br.com.fiap.agrosat.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI agrosatOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("AgroSat API")
                        .version("0.1.0")
                        .description("API da plataforma AgroSat — Global Solution 2026/1 — 4ESOA FIAP.")
                        .contact(new Contact()
                                .name("Equipe AgroSat")));
    }
}
