import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface GeoLocation {
    region: string;
    country: string;
    city: string;
    radiusKm?: bigint;
}
export type Time = bigint;
export interface MatchScore {
    matchedKeywords: Array<string>;
    jobId: string;
    score: bigint;
}
export interface ResumeProfile {
    resumeText: string;
    coverLetterText: string;
    location: GeoLocation;
}
export interface JobPosting {
    id: string;
    title: string;
    owner: Principal;
    description: string;
    company: string;
    applicationUrl?: string;
    datePosted: Time;
    requirements?: string;
    location: string;
    contactDetails?: string;
}
export interface JobApplication {
    status: ApplicationStatus;
    owner: Principal;
    submissionChecklist: Array<string>;
    customCoverLetter?: string;
    jobId: string;
    dateApplied: Time;
    resumeId: string;
    applicationSource?: string;
}
export interface UserProfile {
    name: string;
    email?: string;
}
export enum ApplicationStatus {
    pending = "pending",
    applied = "applied",
    rejected = "rejected",
    interviewing = "interviewing",
    offered = "offered"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addJobPosting(title: string, company: string, location: string, description: string, requirements: string | null, applicationUrl: string | null, contactDetails: string | null): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    calculateJobMatch(jobId: string): Promise<MatchScore | null>;
    createApplication(jobId: string): Promise<string>;
    deleteJobPosting(jobId: string): Promise<void>;
    getAllApplications(): Promise<Array<JobApplication>>;
    getAllJobPostings(): Promise<Array<JobPosting>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getJobApplication(appId: string): Promise<JobApplication | null>;
    getJobApplications(): Promise<Array<JobApplication>>;
    getJobPosting(jobId: string): Promise<JobPosting | null>;
    getJobPostings(): Promise<Array<JobPosting>>;
    getResumeProfile(): Promise<ResumeProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveResumeProfile(resumeText: string, coverLetterText: string, location: GeoLocation): Promise<void>;
    updateApplicationCoverLetter(appId: string, coverLetter: string): Promise<void>;
    updateApplicationStatus(appId: string, status: ApplicationStatus): Promise<void>;
}
