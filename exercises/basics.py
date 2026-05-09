"""
Part 1: Programming Exercises
Implementations of collatz and distinct_numbers functions.
"""


def collatz(n: int) -> list[int]:
    """
    Returns the Collatz sequence starting from n until it reaches 1.

    The Collatz conjecture states:
    - If n is even, divide it by 2.
    - If n is odd, multiply it by 3 and add 1.
    - Repeat until n reaches 1.

    Args:
        n: A positive integer to start the sequence from.

    Returns:
        A list of integers representing the Collatz sequence.
    """
    if n <= 0:
        raise ValueError("n must be a positive integer")

    sequence = [n]
    while n != 1:
        if n % 2 == 0:
            n = n // 2
        else:
            n = 3 * n + 1
        sequence.append(n)
    return sequence


def distinct_numbers(numbers: list[int]) -> list[int]:
    """
    Returns a sorted list of distinct (unique) numbers from the input list.

    Args:
        numbers: A list of integers (may contain duplicates).

    Returns:
        A sorted list of unique integers.
    """
    return sorted(set(numbers))
