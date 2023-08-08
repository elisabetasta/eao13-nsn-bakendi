export type Event = {
  id: number;
  title: string;
  slug: string;
  description?: string;
  creatorid: number;
  created: Date;
};

export type Registration = {
  id: number;
  eventid: number;
  userid: number;
  created: Date;
};

export type Speaker = {
  id: number;
  firstname: string;
  middlename?: string;
  lastname: string;
  imageurl: string;
  eventid: number;
  created: Date;
};

export type User = {
  id: number;
  name: string;
  username: string;
  password: string;
  admin: boolean;
  created: Date;
};

// ??
export type Link = {
  href: string;
};
