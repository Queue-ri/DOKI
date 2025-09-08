package com.doki.reserveservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ReserveServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReserveServiceApplication.class, args);
    }

}
