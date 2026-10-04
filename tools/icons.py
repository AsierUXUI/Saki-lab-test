"""Line icons for the services (24 x 24, drawn with the text colour)."""

PATHS = {
    "compass": '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    "cocktail": '<path d="M4 4h16l-8 9zM12 13v7M8 20.5h8M15 4l3-2.5"/>',
    "lamp": '<path d="M12 2v5M5 14a7 7 0 0 1 14 0zM10 17.5a2 2 0 0 0 4 0"/>',
    "people": '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.3A5 5 0 0 1 21 19"/>',
    "bulb": '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2v.1h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
    "pen": '<path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3"/>',
    "spark": '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.5 2.5M15.2 15.2l2.5 2.5M6.3 17.7l2.5-2.5M15.2 8.8l2.5-2.5"/>',
    "tag": '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    "cutlery": '<path d="M5 3v6a2 2 0 0 0 4 0V3M7 3v18M17 21V3c-2 1.5-3 4-3 7v3h3"/>',
    "wine": '<path d="M8 3h8l-.5 5a3.5 3.5 0 0 1-7 0zM12 11.5V20M8.5 20.5h7"/>',
    "route": '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/>',
    "crate": '<path d="M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"/>',
    "gear": '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    "checklist": '<path d="M10 6h10M10 12h10M10 18h10M4 6l1.2 1.2L7.5 5M4 12l1.2 1.2 2.3-2.2M4 18l1.2 1.2 2.3-2.2"/>',
    "flag": '<path d="M5 21V4M5 4h12l-2.5 4 2.5 4H5"/>',
    "door": '<path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M3 21h18M14.5 12h.01"/>',
    "chat": '<path d="M4 5h11v8H8.5L4 16.5zM15 9h5v8.5L16.5 15H11v-2"/>',
}

# One icon for each service area, and one for each thing it includes (in the order of content.SERVICES)
AREAS = {"A": "compass", "B": "cocktail", "C": "lamp", "D": "people"}
ITEMS = {
    "A": ["bulb", "pen", "spark", "tag"],
    "B": ["cutlery", "wine", "cocktail", "route"],
    "C": ["lamp", "crate", "gear", "checklist"],
    "D": ["people", "flag", "door", "chat"],
}


def icon(name, cls="icon"):
    return (f'<svg class="{cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{PATHS[name]}</svg>')
