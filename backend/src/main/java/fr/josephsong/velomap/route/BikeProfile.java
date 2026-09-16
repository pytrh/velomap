// The bike types a rider can choose. The Angular dropdown sends one of these
// names as the "profile" query parameter; Spring converts the text to the enum
// and answers 400 Bad Request for anything else.
package fr.josephsong.velomap.route;

public enum BikeProfile {
	ROAD, TRIATHLON, MOUNTAIN
}
