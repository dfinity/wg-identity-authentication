const MAX_ALTERNATIVE_ORIGINS = 10;

/**
 * Function to validate the derivationOrigin. The derivationOrigin allows an application to request principals of a
 * different origin, given that origin allows this by listing the requesting application origin in the
 * .well-known/ii-alternative-origins resource.
 * See the spec for more details: https://github.com/dfinity/internet-identity/blob/main/docs/internet-identity-spec.adoc#alternative-frontend-origins
 *
 * @param authRequestOrigin Origin of the application requesting a delegation
 * @param derivationOrigin Origin to use for the principal derivation for this delegation
 */
const validateDerivationOrigin = async ({
                                            requestOrigin,
                                            derivationOrigin,
                                        }) => {
    const alternativeOriginsUrl = derivationOrigin + '/.well-known/ii-alternative-origins';
    let alternativeOriginsObj;
    try {
        alternativeOriginsObj = await fetch(alternativeOriginsUrl).then(res => res.json())
    } catch (e) {
        return {
            result: "invalid",
            message: `Lookup of alternative origins file failed: ${e}`,
        }
    }

    // check for expected property
    if (!Array.isArray(alternativeOriginsObj?.alternativeOrigins)) {
        return {
            result: "invalid",
            message: `resource ${alternativeOriginsUrl} has invalid format: received ${alternativeOriginsObj}`,
        };
    }

    // check number of entries
    if (
        alternativeOriginsObj.alternativeOrigins.length > MAX_ALTERNATIVE_ORIGINS
    ) {
        return {
            result: "invalid",
            message: `Resource ${alternativeOriginsUrl} has too many entries: To prevent misuse at most ${MAX_ALTERNATIVE_ORIGINS} alternative origins are allowed.`,
        };
    }

    // check allowed alternative origins
    if (!alternativeOriginsObj.alternativeOrigins.includes(requestOrigin)) {
        return {
            result: "invalid",
            message: `"${requestOrigin}" is not listed in the list of allowed alternative origins. Allowed alternative origins: ${alternativeOriginsObj.alternativeOrigins}`,
        };

    }
    // all checks passed --> valid
    return {result: "valid"};
}

let args = process.argv.slice(2);
if (args.length !== 2 || args.filter(value => value.includes("help")).length !== 0) {
    console.log(`
Validates whether the supplied dapp origin is allowed to use the supplied derivation origin

The validation is done according to the specification here: https://internetcomputer.org/docs/current/references/ii-spec/#alternative-frontend-origins

Usage:
    node icrc_95.js DAPP_ORIGIN DERIVATION_ORIGIN

Example:
    node icrc_95.js "https://beta.oisy.com" "https://oisy.com"
`
    );
} else {
    validateDerivationOrigin({
        requestOrigin: args[0],
        derivationOrigin: args[1]
    })
        .then(result => console.log(result))
        .catch(error => console.log(error));
}


