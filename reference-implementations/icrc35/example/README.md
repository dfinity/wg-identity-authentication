# ICRC-35 Example

This is an example project that showcases the usage of ICRC-35. There are three modules:

* [shared library](./shared/) - this is a typescript library that is not necessary, but simplifies the integration process of service consumers; such a library is expected to be provided by the service provider;
* [service provider](./service-provider/) - this is a web-service, that provides the "greeting" functionality to other web-services; a web-service may send a name to the service provider, and the latter will respond with "Hello, \<name>!" string;
* [service consumer](./service-consumer/) - this is a web-service, that uses the "greeting" functionality provided by the service provider, in order to extend its own capabilities.
