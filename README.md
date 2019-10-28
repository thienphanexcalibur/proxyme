# PROXYME
💻 A command line interface (CLI) to setup a proxy server for:
- Packets forwarding
- Port forwarding
- Traffics monitoring

🔵 During development phase, sometimes we want to test local environment measures how it behaves on production environment.
Proxyme cuts back time on creating a self-signed certificate yourself (for establishing secure connection aka HTTPS you know it right?), reconfiguring your proxy server with a bunch of code... through a CLI with simple inputs.

This CLI fits these real-life development scenarios:

✅ You want to mock any API served at localhost to an actual domain.

✅ You want to to test several features before deploying to Heroku or any cloudbase hosting which requires HTTPS connection such as Web Workers or Application Cache which requires HTTPS. Proxyme can mock this in your local machine.

✅ You want to bypass CORS policies set by a certain server. Specifically, you want to request to example.api.com but it only allows requests from some certain origins (domains). You can mock a whitelisted doamin with self-signed certificates generated by Proxyme and request to the API normally. 