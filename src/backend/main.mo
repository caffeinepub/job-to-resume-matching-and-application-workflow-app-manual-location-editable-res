import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type GeoLocation = {
    city : Text;
    region : Text;
    country : Text;
    radiusKm : ?Nat;
  };

  type ResumeProfile = {
    resumeText : Text;
    coverLetterText : Text;
    location : GeoLocation;
  };

  public type UserProfile = {
    name : Text;
    email : ?Text;
  };

  type JobPosting = {
    id : Text;
    owner : Principal;
    title : Text;
    company : Text;
    location : Text;
    description : Text;
    requirements : ?Text;
    applicationUrl : ?Text;
    contactDetails : ?Text;
    datePosted : Time.Time;
  };

  type ApplicationStatus = {
    #applied;
    #interviewing;
    #offered;
    #rejected;
    #pending;
  };

  type JobApplication = {
    owner : Principal;
    jobId : Text;
    resumeId : Text;
    customCoverLetter : ?Text;
    submissionChecklist : [Text];
    status : ApplicationStatus;
    dateApplied : Time.Time;
    applicationSource : ?Text;
  };

  type MatchScore = {
    jobId : Text;
    score : Nat;
    matchedKeywords : [Text];
  };

  let jobPostings = Map.empty<Text, JobPosting>();
  let userResumes = Map.empty<Principal, ResumeProfile>();
  let jobApplications = Map.empty<Text, JobApplication>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Resume Profile Management
  public shared ({ caller }) func saveResumeProfile(resumeText : Text, coverLetterText : Text, location : GeoLocation) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let profile : ResumeProfile = {
      resumeText;
      coverLetterText;
      location;
    };
    userResumes.add(caller, profile);
  };

  public query ({ caller }) func getResumeProfile() : async ?ResumeProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get resume profiles");
    };
    userResumes.get(caller);
  };

  // Job Posting Management
  public shared ({ caller }) func addJobPosting(title : Text, company : Text, location : Text, description : Text, requirements : ?Text, applicationUrl : ?Text, contactDetails : ?Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add job postings");
    };

    let jobId = caller.toText() # "_" # company # "_" # title # "_" # Int.abs(Time.now()).toText();
    let job : JobPosting = {
      id = jobId;
      owner = caller;
      title;
      company;
      location;
      description;
      requirements;
      applicationUrl;
      contactDetails;
      datePosted = Time.now();
    };
    jobPostings.add(jobId, job);
    jobId;
  };

  public query ({ caller }) func getJobPostings() : async [JobPosting] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get job postings");
    };
    // Return only jobs owned by the caller
    let allJobs = jobPostings.values().toArray();
    allJobs.filter<JobPosting>(func(job) { job.owner == caller });
  };

  public query ({ caller }) func getJobPosting(jobId : Text) : async ?JobPosting {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get job postings");
    };
    switch (jobPostings.get(jobId)) {
      case (?job) {
        if (job.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own job postings");
        };
        ?job;
      };
      case (null) { null };
    };
  };

  public shared ({ caller }) func deleteJobPosting(jobId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete job postings");
    };
    switch (jobPostings.get(jobId)) {
      case (?job) {
        if (job.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own job postings");
        };
        jobPostings.remove(jobId);
      };
      case (null) { Runtime.trap("Job posting not found") };
    };
  };

  // Job Application Management
  public shared ({ caller }) func createApplication(jobId : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create applications");
    };
    switch (jobPostings.get(jobId), userResumes.get(caller)) {
      case (?job, ?resume) {
        // Verify the job belongs to the caller
        if (job.owner != caller) {
          Runtime.trap("Unauthorized: Can only create applications for your own job postings");
        };
        let appId = caller.toText() # "_" # jobId # "_" # Int.abs(Time.now()).toText();
        let application : JobApplication = {
          owner = caller;
          jobId;
          resumeId = caller.toText() # "_" # jobId;
          customCoverLetter = null;
          submissionChecklist = ["Resume attached", "Cover letter attached"];
          status = #pending;
          dateApplied = Time.now();
          applicationSource = null;
        };
        jobApplications.add(appId, application);
        appId;
      };
      case (null, _) { Runtime.trap("Job not found") };
      case (_, null) { Runtime.trap("Resume not found") };
    };
  };

  public shared ({ caller }) func updateApplicationStatus(appId : Text, status : ApplicationStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update application status");
    };

    switch (jobApplications.get(appId)) {
      case (?application) {
        // Verify ownership
        if (application.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own applications");
        };
        let updatedApplication : JobApplication = {
          owner = application.owner;
          jobId = application.jobId;
          resumeId = application.resumeId;
          customCoverLetter = application.customCoverLetter;
          submissionChecklist = application.submissionChecklist;
          status;
          dateApplied = application.dateApplied;
          applicationSource = application.applicationSource;
        };
        jobApplications.add(appId, updatedApplication);
      };
      case (null) { Runtime.trap("Application not found") };
    };
  };

  public shared ({ caller }) func updateApplicationCoverLetter(appId : Text, coverLetter : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update applications");
    };

    switch (jobApplications.get(appId)) {
      case (?application) {
        if (application.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own applications");
        };
        let updatedApplication : JobApplication = {
          owner = application.owner;
          jobId = application.jobId;
          resumeId = application.resumeId;
          customCoverLetter = ?coverLetter;
          submissionChecklist = application.submissionChecklist;
          status = application.status;
          dateApplied = application.dateApplied;
          applicationSource = application.applicationSource;
        };
        jobApplications.add(appId, updatedApplication);
      };
      case (null) { Runtime.trap("Application not found") };
    };
  };

  public query ({ caller }) func getJobApplications() : async [JobApplication] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get job applications");
    };
    // Return only applications owned by the caller
    let allApplications = jobApplications.values().toArray();
    allApplications.filter<JobApplication>(func(app) { app.owner == caller });
  };

  public query ({ caller }) func getJobApplication(appId : Text) : async ?JobApplication {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get job applications");
    };
    switch (jobApplications.get(appId)) {
      case (?application) {
        if (application.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own applications");
        };
        ?application;
      };
      case (null) { null };
    };
  };

  // Matching/Scoring System
  public query ({ caller }) func calculateJobMatch(jobId : Text) : async ?MatchScore {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can calculate job matches");
    };

    switch (jobPostings.get(jobId), userResumes.get(caller)) {
      case (?job, ?resume) {
        if (job.owner != caller) {
          Runtime.trap("Unauthorized: Can only match your own job postings");
        };
        // Simple keyword matching algorithm
        let jobText = job.description # " " # (switch (job.requirements) { case (?req) req; case (null) "" }).toLower();
        let resumeText = resume.resumeText.toLower();

        let keywords = ["engineer", "developer", "manager", "analyst", "designer", "python", "java", "javascript", "leadership", "communication"];
        var matchCount = 0;
        var matchedKeywords : [Text] = [];

        for (keyword in keywords.vals()) {
          if (jobText.contains(#text keyword) and resumeText.contains(#text keyword)) {
            matchCount += 1;
            matchedKeywords := matchedKeywords.concat([keyword]);
          };
        };

        let score = (matchCount * 100) / keywords.size();
        ?{
          jobId;
          score;
          matchedKeywords;
        };
      };
      case (null, _) { null };
      case (_, null) { null };
    };
  };

  // Admin functions
  public query ({ caller }) func getAllJobPostings() : async [JobPosting] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all job postings");
    };
    jobPostings.values().toArray();
  };

  public query ({ caller }) func getAllApplications() : async [JobApplication] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all applications");
    };
    jobApplications.values().toArray();
  };
};
