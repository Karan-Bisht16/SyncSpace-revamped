// importing types
import type { Document, ObjectId } from 'mongoose';

export const ActionTypes = [
    'account-activity',
    'account-deactivated',
    'post-created',
    'post-commented',
    'post-liked',
    'post-saved',
    'post-shared',
    'subspace-joined',
    'subspace-left',
    'subspace-created',
] as const;
export type ActionType = typeof ActionTypes[number];

export const AbstractTargetTypes = ['account'] as const;
export type AbstractTargetType = typeof AbstractTargetTypes[number];

export const EntityTargetTypes = ['post', 'subspace', 'user', 'comment'] as const;
export type EntityTargetType = typeof EntityTargetTypes[number];

export const TargetTypes = [...AbstractTargetTypes, ...EntityTargetTypes] as const;
export type TargetType = typeof TargetTypes[number];

export type InteractionCore = {
    description: string,
    userId: ObjectId,
    action: ActionType,
};

export type InteractionWithTarget = {
    target: EntityTargetType;
    targetId: ObjectId;
} & InteractionCore;

export type InteractionWithAccount = {
    target: AbstractTargetType;
} & InteractionCore;

export type InteractionBase = InteractionWithTarget | InteractionWithAccount;

export type InteractionDocument = Document & InteractionBase;