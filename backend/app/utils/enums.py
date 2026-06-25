from enum import StrEnum


class ConversationType(StrEnum):
    DIRECT = "DIRECT"
    GROUP = "GROUP"


class ParticipantRole(StrEnum):
    ADMIN = "ADMIN"
    MEMBER = "MEMBER"


class MessageType(StrEnum):
    TEXT = "TEXT"
    IMAGE = "IMAGE"
    FILE = "FILE"


class MessageStatus(StrEnum):
    SENDING = "SENDING"
    SENT = "SENT"
    DELIVERED = "DELIVERED"
    READ = "READ"
