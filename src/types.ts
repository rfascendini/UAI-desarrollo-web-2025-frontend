export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
};

export type Player = {
  user: Pick<UserProfile, 'id' | 'firstName' | 'lastName' | 'username'>;
  position: number;
};

export type Room = {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  playerCount: number;
  max_players: number;
  createdBy: Player['user'];
  users: Player[];
  isMember: boolean;
  isHost: boolean;
  connection: null | {
    serverIP: string;
    serverPort: number;
    serverPassword: string;
    command: string;
    steamUrl: string;
  };
};

export type ModalName =
  | 'login'
  | 'register'
  | 'reset'
  | 'profile'
  | 'password'
  | 'delete'
  | 'create'
  | 'edit'
  | 'join'
  | 'move'
  | 'kick'
  | 'transfer'
  | 'close'
  | 'leave'
  | null;
