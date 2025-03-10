use candid::{self, CandidType, Deserialize};

#[derive(CandidType, Deserialize, Eq, PartialEq, Debug)]
pub struct Icrc21ConsentMessageMetadata {
    pub language: String,
    pub utc_offset_minutes: Option<i16>,
}

#[derive(CandidType, Deserialize)]
pub enum Icrc21DeviceSpec {
    GenericDisplay,
    FieldsDisplay,
}

#[derive(CandidType, Deserialize)]
pub struct Icrc21ConsentMessageSpec {
    pub metadata: Icrc21ConsentMessageMetadata,
    pub device_spec: Option<Icrc21DeviceSpec>,
}

#[derive(CandidType, Deserialize)]
pub struct Icrc21ConsentMessageRequest {
    pub arg: serde_bytes::ByteBuf,
    pub method: String,
    pub user_preferences: Icrc21ConsentMessageSpec,
}

#[derive(CandidType, Deserialize, Eq, PartialEq, Debug)]
pub enum Icrc21ConsentMessage {
    GenericDisplayMessage(String),
    FieldsDisplayMessage {
        intent: String,
        fields: Vec<(String, String)>,
    },
}

#[derive(CandidType, Deserialize, Eq, PartialEq, Debug)]
pub struct Icrc21ConsentInfo {
    pub metadata: Icrc21ConsentMessageMetadata,
    pub consent_message: Icrc21ConsentMessage,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct Icrc21ErrorInfo {
    pub description: String,
}

#[derive(CandidType, Deserialize, Debug)]
pub enum Icrc21Error {
    GenericError {
        description: String,
        error_code: candid::Nat,
    },
    InsufficientPayment(Icrc21ErrorInfo),
    UnsupportedCanisterCall(Icrc21ErrorInfo),
    ConsentMessageUnavailable(Icrc21ErrorInfo),
}

#[derive(CandidType, Deserialize, Eq, PartialEq, Debug)]
pub struct Icrc21SupportedStandard {
    pub url: String,
    pub name: String,
}
