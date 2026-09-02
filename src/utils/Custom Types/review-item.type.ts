export type reviewItems = {
    id: string,
    user: {
        id: string,
        avatar_url: string
        username: string
    },
    rating: number,
    comment: string,
    created_at: Date
};