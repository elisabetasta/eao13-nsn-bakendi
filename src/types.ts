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

// Define enums
enum UserType {
  Parent = 'parent',
  Caregiver = 'caregiver',
  PhysicalTherapist = 'physical therapist',
  SpeechTherapist = 'speech therapist',
  Driver = 'driver',
}

enum IncidentFeedback {
  Good = 'good',
  Neutral = 'neutral',
  Bad = 'bad',
}

// Define table types
interface UserTypes {
  id: number;
  type: UserType;
}

interface User {
  id: number;
  name: string;
  username: string;
  password: string;
  admin: boolean;
  user_type_id: number;
  created: string;
}

interface IncidentFeedbacks {
  id: number;
  feedback: IncidentFeedback;
}

interface Incident {
  id: number;
  title: string;
  slug: string;
  description: string;
  feedback_id: number;
  child_id: number;
  user_id: number;
  created: string;
  updated: string;
}

interface Child {
  id: number;
  name: string;
  group_id: number | null;
}

interface UserGroups {
  id: number;
  child_id: number;
  user_id: number;
}

export { Child, Incident, IncidentFeedback, IncidentFeedbacks, User, UserGroups, UserType, UserTypes };

