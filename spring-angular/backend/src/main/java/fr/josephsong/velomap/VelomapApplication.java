// Entry point of the backend. Running main() starts an embedded web server on
// port 8080. @SpringBootApplication tells Spring to scan this package and its
// sub-packages for classes marked @RestController, @Service, @Component, etc.,
// create one instance of each, and wire them together through their constructors.
package fr.josephsong.velomap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class VelomapApplication {

	public static void main(String[] args) {
		SpringApplication.run(VelomapApplication.class, args);
	}

}
