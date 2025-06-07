#!/bin/env python
from booklovin.models.journals import Mood
from booklovin.models.users import UserRole
from booklovin.models.errors import ErrorCode

enumTypes = (Mood, UserRole, ErrorCode)

for t in enumTypes:
    print()
    print(f"const {t.__name__}Types = {{")
    for e in t:
        print(f"  {e.name.lower()}: {e.value},")
    print("}")
print(f"\nexport default {{ {', '.join(t.__name__ + 'Types' for t in enumTypes)} }}")
