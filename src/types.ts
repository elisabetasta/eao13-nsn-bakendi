// export type Event = {
//   id: number;
//   title: string;
//   slug: string;
//   description?: string;
//   creatorid: number;
//   created: Date;
// };

// export type Registration = {
//   id: number;
//   eventid: number;
//   userid: number;
//   created: Date;
// };

// export type Speaker = {
//   id: number;
//   firstname: string;
//   middlename?: string;
//   lastname: string;
//   imageurl: string;
//   eventid: number;
//   created: Date;
// };

// export type User = {
//   id: number;
//   name: string;
//   username: string;
//   password: string;
//   admin: boolean;
//   created: Date;
// };

// // ??
// export type Link = {
//   href: string;
// };


// types.ts

// User Types
interface UserType {
  id: number;
  type: UserTypeValue;
}

type UserTypeValue =
  'parent' |
  'caregiver' |
  'physical therapist' |
  'speech therapist' |
  'driver';

// User Groups
interface UserGroup {
  id: number;
  child_id: number;
  user_id: number;
}

// Children
interface Child {
  id: number;
  name: string;
  group_id?: number;
}

// Incidents
interface Incident {
  id: number;
  title: string;
  slug: string;
  description: string;
  feedback?: IncidentFeedback;
  child_id?: number;
  user_id?: number;
  created: Date;
  updated: Date;
}

type IncidentFeedback =
  'good' |
  'neutral' |
  'bad';

// Users
interface User {
  id: number;
  name: string;
  username: string;
  password: string;
  admin: boolean;
  type: UserType;
  created: Date;
}

export {
  Child,
  Incident,
  IncidentFeedback,
  User,
  UserGroup,
  UserType,
  UserTypeValue
};

