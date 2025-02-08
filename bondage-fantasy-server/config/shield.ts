import app from "@adonisjs/core/services/app";
import { defineConfig } from "@adonisjs/shield";

const shieldConfig = defineConfig({
  /**
   * Configure CSP policies for your app. Refer documentation
   * to learn more
   */
  csp: {
    enabled: false,
    directives: {},
    reportOnly: false,
  },

  /**
   * Configure CSRF protection options. Refer documentation
   * to learn more
   */
  csrf: {
    enabled: true,
    exceptRoutes: ["/api/session", "/files/*"],
    enableXsrfCookie: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    cookieOptions: {
      sameSite: "strict",
      secure: app.inProduction,
    },
  },

  /**
   * Control how your website should be embedded inside
   * iFrames
   */
  xFrame: {
    enabled: true,
    action: "DENY",
  },

  /**
   * Force browser to always use HTTPS
   */
  hsts: {
    enabled: true,
    maxAge: "180 days",
  },

  /**
   * Disable browsers from sniffing the content type of a
   * response and always rely on the "content-type" header.
   */
  contentTypeSniffing: {
    enabled: true,
  },
});

export default shieldConfig;
