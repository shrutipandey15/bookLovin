import argparse
import importlib
import inspect
from typing import Any, Callable, List, Protocol, Type, get_type_hints

from booklovin.core.settings import AVAILABLE_DB_ENGINES


def extract_members(obj):
    return {
        k: v
        for k, v in inspect.getmembers(obj)
        if not k.startswith("_") and isinstance(v, Callable)
    }


def explain_mismatch(a1, a2):
    text = []
    # compute differences between the two dicts:
    missing_keys = set(a1.keys()).symmetric_difference(set(a2.keys()))
    if missing_keys:
        text.append(f"      /!\ missing keys: {missing_keys}")
    for k, v in a1.items():
        if v is Any:
            continue
        v2 = a2.get(k)
        if v != v2:
            text.append(f"        '{k}' ==> {v} != {v2}")
    return "\n".join(text)


def get_protocol_compliance_issues(
    obj_to_check: Any, protocol_class: Protocol
) -> List[str]:
    """
    Checks an object (e.g., a module or class instance) for compliance
    with a given Protocol and returns a list of issues.
    """
    if not (inspect.isclass(protocol_class) and issubclass(protocol_class, Protocol)):  # type: ignore
        raise TypeError(
            f"Expected a Protocol type for 'protocol_class', got {type(protocol_class)}"
        )

    issues: List[str] = []

    ref_members = extract_members(protocol_class)
    inspected_members = extract_members(obj_to_check)

    for k, v in ref_members.items():
        v2 = inspected_members.get(k)
        if v2 is None:
            issues.append(f"Missing function: '{k}'")
            continue
        ref_a = inspect.get_annotations(v)
        ref_b = inspect.get_annotations(v2)
        if ref_a != ref_b:
            mismatch = explain_mismatch(ref_a, ref_b)
            if mismatch:
                issues.append(f"   {k}:\n{mismatch}")

    return issues


if __name__ == "__main__":
    from booklovin.models.types import PostService, UserService

    protocols = (PostService, UserService)
    for engine in reversed(AVAILABLE_DB_ENGINES):
        user_module = importlib.import_module(
            f"booklovin.services.database.{engine}.users"
        )
        issues = get_protocol_compliance_issues(user_module, UserService)
        if issues:
            print(" ", engine, ":: UserService  ")
            for issue in issues:
                print(issue)
        post_module = importlib.import_module(
            f"booklovin.services.database.{engine}.post"
        )
        issues = get_protocol_compliance_issues(post_module, PostService)
        if issues:
            print(" ", engine, ":: PostService  ")
            for issue in issues:
                print(issue)
