export class CreateLogDto {
    user_id: number;
    whose_actions: string;
    object_operation: string;
    new_field: string;
    old_field: string;
}