export type reviewItems = {
    id: string,
    user: {
        id: string,
        username: string
    },
    rating: number,
    comment: string,
    created_at: Date
};