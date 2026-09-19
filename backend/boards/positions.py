def compute_position(before=None, after=None):
    """
    Returns a position float that sits between `before` and `after`.
    Pass only `after` to place at the very start.
    Pass only `before` to place at the very end.
    Pass neither for the first item in an empty list.
    """
    if before is None and after is None:
        return 1.0
    if before is None:
        return after / 2
    if after is None:
        return before + 1.0
    return (before + after) / 2
