"""Pagination utility for API views."""

from __future__ import annotations

import math
from typing import TYPE_CHECKING, TypedDict


if TYPE_CHECKING:
    from rest_framework.request import Request


class PaginationData(TypedDict):
    """Type definition for pagination response data."""

    page: int
    page_size: int
    next_page: int | None
    prev_page: int | None
    total_pages: int
    start_item: int
    end_item: int
    start_index: int
    end_index: int
    total_items: int


def get_pagination_data(request: Request, total_items: int) -> PaginationData:
    """
    Calculate pagination metadata from request query parameters.

    Args:
        request: The DRF request object containing query parameters.
        total_items: Total number of items to paginate.

    Returns:
        Dictionary containing pagination metadata including page numbers,
        item ranges, and navigation info.
    """
    # Parse query params defensively
    try:
        page = int(request.GET.get('page', 1))
    except (TypeError, ValueError):
        page = 1
    try:
        page_size = int(request.GET.get('page_size', 10))
    except (TypeError, ValueError):
        page_size = 10

    if page < 1:
        page = 1
    if page_size <= 0:
        page_size = 10

    total_pages = max(1, math.ceil(total_items / page_size)) if page_size > 0 else 1
    next_page = page + 1 if page < total_pages else None
    prev_page = page - 1 if page > 1 else None

    start_index = max(0, (page - 1) * page_size)
    end_index = min(page * page_size, total_items)

    start_item = start_index + 1 if total_items > 0 else 0
    end_item = end_index

    return {
        'page': page,
        'page_size': page_size,
        'next_page': next_page,
        'prev_page': prev_page,
        'total_pages': total_pages,
        'start_item': start_item,
        'end_item': end_item,
        'start_index': start_index,
        'end_index': end_index,
        'total_items': total_items,
    }
