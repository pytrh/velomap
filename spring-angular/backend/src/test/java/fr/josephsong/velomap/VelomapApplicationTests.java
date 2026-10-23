// Smoke test: starts the whole Spring application in memory and fails if any
// class can't be created or wired together. Run with ./mvnw test.
package fr.josephsong.velomap;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class VelomapApplicationTests {

	@Test
	void contextLoads() {
	}

}
