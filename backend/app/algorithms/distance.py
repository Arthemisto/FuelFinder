from math import atan2, cos, radians, sin, sqrt


def calculate_distance_km(
    first_latitude: float,
    first_longitude: float,
    second_latitude: float,
    second_longitude: float,
) -> float:
    earth_radius_km = 6371.0

    latitude_distance = radians(second_latitude - first_latitude)
    longitude_distance = radians(second_longitude - first_longitude)

    start_latitude = radians(first_latitude)
    end_latitude = radians(second_latitude)

    haversine = (
        sin(latitude_distance / 2) ** 2
        + cos(start_latitude)
        * cos(end_latitude)
        * sin(longitude_distance / 2) ** 2
    )

    return earth_radius_km * 2 * atan2(sqrt(haversine), sqrt(1 - haversine))