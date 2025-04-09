// lib/dashboard/utils/date.ts

export const startOfDay = (date: Date): Date => new Date(date.setHours(0, 0, 0, 0));

export const endOfDay = (date: Date): Date => new Date(date.setHours(23, 59, 59, 999));

export const cloneDate = (date: Date): Date => new Date(date.getTime());