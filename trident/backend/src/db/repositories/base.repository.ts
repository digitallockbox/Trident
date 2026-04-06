export class BaseRepository {
    protected collection: string;

    constructor(collection: string) {
        this.collection = collection;
    }
}
