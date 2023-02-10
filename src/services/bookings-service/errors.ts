import { ApplicationError } from "@/protocols";

export function roomNotFoundError(): ApplicationError {
    return {
        name: "roomNotFoundError",
        message: "There is not a room with the given id",
    };
}

export function fullRoomError(): ApplicationError {
    return {
        name: "fullRoomError",
        message: "The chosen room is at capacity",
    };
}

export function businessRuleError(): ApplicationError {
    return {
        name: "businessRuleError",
        message: "Business rules not respected ",
    };
}
