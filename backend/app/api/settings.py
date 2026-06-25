from fastapi import APIRouter

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("")
def settings_placeholder():
    return {
        "privacy": "Coming Soon",
        "notifications": "Coming Soon",
        "appearance": "Coming Soon",
        "linked_devices": "Coming Soon",
    }
