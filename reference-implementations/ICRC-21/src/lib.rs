use crate::icrc21_types::{
    Icrc21ConsentInfo, Icrc21ConsentMessage, Icrc21ConsentMessageMetadata,
    Icrc21ConsentMessageRequest, Icrc21DeviceSpec, Icrc21Error, Icrc21ErrorInfo,
    Icrc21SupportedStandard,
};
use itertools::Itertools;
use Icrc21ConsentMessage::{FieldsDisplayMessage, GenericDisplayMessage};
use Icrc21DeviceSpec::{FieldsDisplay, GenericDisplay};
use Icrc21Error::UnsupportedCanisterCall;

mod icrc21_types;

#[ic_cdk::query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}

#[ic_cdk::query]
fn icrc10_supported_standards() -> Vec<Icrc21SupportedStandard> {
    vec![
        Icrc21SupportedStandard {
            url: "https://github.com/dfinity/ICRCs/ICRC-10.md".to_string(),
            name: "ICRC-10".to_string(),
        },
        Icrc21SupportedStandard {
            url: "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-21/ICRC-21.md".to_string(),
            name: "ICRC-21".to_string(),
        },
    ]
}

#[ic_cdk::update]
fn icrc21_canister_call_consent_message(
    consent_msg_request: Icrc21ConsentMessageRequest,
) -> Result<Icrc21ConsentInfo, Icrc21Error> {
    if consent_msg_request.method != "greet" {
        return Err(UnsupportedCanisterCall(Icrc21ErrorInfo {
            description: "Only the 'greet' method is supported".to_string(),
        }));
    }

    let Ok(name) = candid::decode_one::<String>(&consent_msg_request.arg) else {
        return Err(UnsupportedCanisterCall(Icrc21ErrorInfo {
            description: "Failed to decode the argument".to_string(),
        }));
    };

    let metadata = Icrc21ConsentMessageMetadata {
        // only English supported
        language: "en".to_string(),
        // no time information in the consent message
        utc_offset_minutes: None,
    };

    match consent_msg_request.user_preferences.device_spec {
        Some(FieldsDisplay) => Ok(Icrc21ConsentInfo {
            metadata,
            consent_message: FieldsDisplayMessage {
                title: "Review transaction to greet".into(),
                fields: vec![("Greet".into(), name.clone())],
                action: "Sign transaction to greet".into(),
            },
        }),
        Some(GenericDisplay) | None => Ok(Icrc21ConsentInfo {
            metadata,
            consent_message: GenericDisplayMessage(consent_msg_text_md(&greet(name.clone()))),
        }),
    }
}

fn consent_msg_text_md(greeting: &str) -> String {
    format!("Produce the following greeting text:\n> {}", greeting)
}

// Order dependent: do not move above any function annotated with #[candid_method]!
candid::export_service!();

#[cfg(test)]
mod test {
    use super::*;
    use crate::__export_service;
    use crate::icrc21_types::Icrc21ConsentMessage::{FieldsDisplayMessage, GenericDisplayMessage};
    use crate::icrc21_types::Icrc21ConsentMessageSpec;
    use crate::icrc21_types::Icrc21DeviceSpec::FieldsDisplay;
    use candid_parser::utils::{service_equal, CandidSource};
    use serde_bytes::ByteBuf;
    use std::path::Path;

    /// Checks candid interface type equality by making sure that the service in the did file is
    /// a subtype of the generated interface and vice versa.
    #[test]
    fn check_candid_interface_compatibility() {
        let canister_interface = __export_service();
        service_equal(
            CandidSource::Text(&canister_interface),
            CandidSource::File(Path::new("icrc21_reference_canister.did")),
        )
        .unwrap_or_else(|e| {
            panic!(
                "the canister code interface is not equal to the did file: {:?}",
                e
            )
        });
    }

    #[test]
    fn should_greet() {
        assert_eq!(greet("Alice".to_string()), "Hello, Alice!");
    }

    #[test]
    fn should_declare_icrc21_support() {
        assert_eq!(
            icrc10_supported_standards(),
            vec![
                Icrc21SupportedStandard {
                    url: "https://github.com/dfinity/ICRCs/ICRC-10.md".to_string(),
                    name: "ICRC-10".to_string(),
                },
                Icrc21SupportedStandard {
                    url: "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-21/ICRC-21.md"
                        .to_string(),
                    name: "ICRC-21".to_string(),
                }
            ]
        );
    }

    #[test]
    fn should_return_generic_display_message() -> Result<(), Icrc21Error> {
        let result = icrc21_canister_call_consent_message(Icrc21ConsentMessageRequest {
            arg: ByteBuf::from(candid::encode_one("Alice").unwrap()),
            method: "greet".to_string(),
            user_preferences: Icrc21ConsentMessageSpec {
                metadata: Icrc21ConsentMessageMetadata {
                    language: "en".to_string(),
                    utc_offset_minutes: None,
                },
                device_spec: Some(GenericDisplay),
            },
        })?;
        assert_eq!(
            result,
            Icrc21ConsentInfo {
                metadata: Icrc21ConsentMessageMetadata {
                    language: "en".to_string(),
                    utc_offset_minutes: None,
                },
                consent_message: GenericDisplayMessage(
                    "Produce the following greeting text:\n> Hello, Alice!".to_string()
                ),
            }
        );
        Ok(())
    }

    #[test]
    fn should_return_fields_display_message() -> Result<(), Icrc21Error> {
        let result = icrc21_canister_call_consent_message(Icrc21ConsentMessageRequest {
            arg: ByteBuf::from(candid::encode_one("Alice").unwrap()),
            method: "greet".to_string(),
            user_preferences: Icrc21ConsentMessageSpec {
                metadata: Icrc21ConsentMessageMetadata {
                    language: "en".to_string(),
                    utc_offset_minutes: None,
                },
                device_spec: Some(FieldsDisplay),
            },
        })?;
        assert_eq!(
            result,
            Icrc21ConsentInfo {
                metadata: Icrc21ConsentMessageMetadata {
                    language: "en".to_string(),
                    utc_offset_minutes: None,
                },
                consent_message: FieldsDisplayMessage {
                    title: "Review transaction to greet".into(),
                    fields: vec![("Greet".to_string(), "Alice".to_string())],
                    action: "Sign transaction to greet".into()
                },
            }
        );
        Ok(())
    }
}
