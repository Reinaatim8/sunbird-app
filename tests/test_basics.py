"""
Tests for exercises/basics.py
Run with: pytest
"""
import pytest
from exercises.basics import collatz, distinct_numbers


#collatz

class TestCollatz:
    def test_collatz_1(self):
        assert collatz(1) == [1]

    def test_collatz_2(self):
        assert collatz(2) == [2, 1]

    def test_collatz_6(self):
        assert collatz(6) == [6, 3, 10, 5, 16, 8, 4, 2, 1]

    def test_collatz_starts_with_n(self):
        seq = collatz(10)
        assert seq[0] == 10

    def test_collatz_ends_with_1(self):
        for n in [3, 7, 15, 27]:
            assert collatz(n)[-1] == 1

    def test_collatz_27_length(self):
        # Known sequence length for n=27 is 112
        assert len(collatz(27)) == 112

    def test_collatz_invalid_input(self):
        with pytest.raises((ValueError, Exception)):
            collatz(0)

    def test_collatz_all_positive(self):
        for val in collatz(13):
            assert val > 0


#distinct_numbers

class TestDistinctNumbers:
    def test_no_duplicates(self):
        assert distinct_numbers([1, 2, 3]) == [1, 2, 3]

    def test_with_duplicates(self):
        assert distinct_numbers([4, 2, 2, 1, 4]) == [1, 2, 4]

    def test_all_same(self):
        assert distinct_numbers([5, 5, 5]) == [5]

    def test_empty_list(self):
        assert distinct_numbers([]) == []

    def test_single_element(self):
        assert distinct_numbers([42]) == [42]

    def test_already_sorted(self):
        assert distinct_numbers([1, 2, 3, 4, 5]) == [1, 2, 3, 4, 5]

    def test_unsorted_duplicates(self):
        assert distinct_numbers([3, 1, 4, 1, 5, 9, 2, 6, 5]) == [1, 2, 3, 4, 5, 6, 9]

    def test_negatives(self):
        assert distinct_numbers([-3, -1, -3, 0, 2]) == [-3, -1, 0, 2]
