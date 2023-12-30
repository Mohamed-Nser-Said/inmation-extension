

export type Authority = "inmation" | "ad" | "machine" | "builtin";
export type IncludeClaims = "email" | "family_name" | "given_name" | "middle_name" | "phone_number";

export type Auth = {
    username?: string;
    password?: string;
    authority?: Authority;
    grant_type?: string;
    include_claims?: IncludeClaims[];
    authorization?: string;
    disconnect_on_access_denied?: boolean;
    
}




export type Options = {
    auth?: Auth;
    tim?: number;
    wsOptions?: any;
    ign?: boolean; // ignore response
    roe?: boolean; // return only error
    fetch?: string; // (write_fetch), "OPC_READ_CACHE_BEFORE_WRITE"
    delay?: number; // (write_delay) AKA pack delay
    audit?: boolean; // (write_audit) SuppressAuditWrite
    group?: boolean; // (write_group)
    timeo?: number; // (write_timeo)
    scc?: string; // scope comment
   
}





