from app.algorithms.distance import calculate_distance_km


def test_calculate_distance_km_returns_zero_for_same_coordinates() -> None:
    distance = calculate_distance_km(
        56.9496,
        24.1052,
        56.9496,
        24.1052,
    )

    assert distance == 0


def test_calculate_distance_km_between_riga_and_jelgava() -> None:
    distance = calculate_distance_km(
        56.9496,
        24.1052,
        56.6511,
        23.7214,
    )

    assert round(distance, 1) == 40.6