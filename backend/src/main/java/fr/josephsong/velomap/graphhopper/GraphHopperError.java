// Mirror of the error body GraphHopper returns on a rejected request,
// e.g. {"message": "For your account the profile parameter can only be one of ..."}.
package fr.josephsong.velomap.graphhopper;

public record GraphHopperError(String message) {
}
