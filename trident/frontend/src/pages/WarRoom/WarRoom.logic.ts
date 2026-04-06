export type WarRoomState = {
  online: boolean;
};

export const getWarRoomState = (): WarRoomState => ({
  online: true,
});
