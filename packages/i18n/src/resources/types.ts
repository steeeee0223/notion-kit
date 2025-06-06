interface Resources {
  settings: {
    settings: "Settings";
    common: {
      account: "Account";
      workspace: "Workspace";
      upgrade: "Upgrade";
      more: "Learn more";
    };
    account: {
      account: {
        title: "Account";
        "preferred-name": "Preferred name";
        "remove-photo": "Remove photo";
        "replace-photo": "Replace photo";
      };
      "account-security": {
        title: "Account security";
        email: {
          title: "Email";
          button: "Change email";
        };
        password: {
          title: "Password";
          description: "If you lose access to your school email address, you'll be able to log in using your password.";
          button: "Change password";
        };
        verification: {
          title: "2-step verification";
          description: "Add an additional layer of security to your account during login.";
          button: "Add verification method";
        };
        passkeys: {
          title: "Passkeys";
          description: "Securely sign-in with on-device biometric authentication.";
          button: "Add passkey";
        };
      };
      support: {
        title: "Support";
        support: {
          title: "Support access";
          description: "Grant Notion support temporary access to your account so we can troubleshoot problems or recover content on your behalf. You can revoke access at any time.";
        };
        delete: {
          title: "Delete my account";
          description: "Permanently delete the account and remove access from all workspaces.";
        };
      };
      devices: {
        title: "Devices";
        logout: {
          title: "Log out of all devices";
          description: "Log out of all other active sessions on other devices besides this one.";
          button: "Log out of all devices";
        };
      };
    };
    preferences: {
      title: "Preferences";
      preferences: {
        appearance: {
          title: "Appearance";
          description: "Customize how Notion looks on your device.";
          options: {
            system: "Use system setting";
            light: "Light";
            dark: "Dark";
          };
        };
      };
      region: {
        title: "Language & Time";
        language: {
          title: "Language";
          description: "Change the language used in the user interface.";
          options: {
            en: {
              label: "English";
              description: "English";
            };
            de: {
              label: "Deutsch";
              description: "German";
            };
            es: {
              label: "Español";
              description: "Spanish";
            };
          };
        };
        "start-week": {
          title: "Start week on Monday";
          description: "This will change how all calendars in your app look.";
        };
        "set-timezone": {
          title: "Set timezone automatically using your location";
          description: "Reminders, notifications and emails are delivered based on your time zone.";
        };
        timezone: {
          title: "Timezone";
          description: "Current timezone setting.";
        };
      };
      desktop: {
        title: "Desktop App";
        "open-links": {
          title: "Open links in desktop app";
          description: "You must have the <0>macOS app</0> installed";
        };
        "open-on-start": {
          title: "Open on start";
          description: "Choose what to show when Notion starts or when you switch workspaces.";
          options: {
            last: "Last visited page";
            home: "Home";
            top: "Top page in sidebar";
          };
        };
      };
      privacy: {
        title: "Privacy";
        cookie: {
          title: "Cookie settings";
          description: "Customize cookies. See <0>Cookie Notice</0> for details.";
        };
        "view-history": {
          title: "Show my view history";
          description: "People with edit or full access will be able to see when you've viewed a page. <0>Leran more</0>.";
          options: {
            yes: "Record";
            no: "Don't record";
          };
        };
        "discover-profile": {
          title: "Profile discoverability";
          description: "Users with your email can see your name and profile picture when inviting you to a new workspace. <0>Learn more</0>.";
        };
      };
      modals: {
        language: {
          title: "Are you sure you want to update the language to {{language}}?";
          primary: "Update";
          secondary: "Cancel";
        };
      };
    };
    notifications: {
      title: "Notifications";
      notifications: {
        mobile: {
          title: "Mobile push notifications";
          description: "Receive push notifications on mentions and comments via your mobile app";
        };
      };
      slack: {
        title: "Slack notifications";
        slack: {
          title: "Slack notifications";
          description: "Receive notifications in your Slack workspace when you're mentioned in a page, database property, or comment";
          options: {
            off: "Off";
          };
        };
      };
      email: {
        title: "Email notifications";
        activity: {
          title: "Activity in your workspace";
          description: "Receive emails when you get comments, mentions, page invites, reminders, access requests, and property changes";
        };
        digests: {
          title: "Email digests";
          description: "Receive email digests every 8 hours for changes to pages you're subscribed to";
        };
        announcements: {
          title: "Announcements and update emails";
          description: "Receive occasional emails about product launches and new features from Notion";
          button: "Manage settings";
        };
      };
      buttons: {
        more: "Learn about notifications";
      };
    };
    "my-connections": {
      title: "Connections";
      discover: {
        title: "Discover new connections";
        buttons: {
          connect: "Connect";
          more: "See all";
          less: "Show less";
        };
      };
      buttons: {
        browse: "Browse connections in Gallery";
        integrations: "Develop or manage integrations";
        more: "Learn more about connections";
      };
    };
    general: {
      title: "General";
      workspace: {
        title: "Workspace settings";
        name: {
          title: "Name";
          description: "You can use your organization or company name. Keep it simple.";
        };
        icon: {
          title: "Icon";
          description: "Upload an image or pick an emoji. It will show up in your sidebar and notifications.";
        };
      };
      public: {
        title: "Public settings";
        domain: {
          title: "Domain";
          description: "Pages shared to web will be under <0>{{site}}</0>. Anyone with an allowed email domain can join this workspace via <0>{{link}}</0>.";
        };
        public: {
          title: "Public home page";
          description: "Access your public home page via <0>{{site}}</0>.";
        };
      };
      export: {
        title: "Export";
        content: {
          title: "Export content";
          hint: "Learn about exporting workspaces.";
          button: "Export all workspace content";
        };
        members: {
          title: "Export members";
          hint: "Learn about exporting members.";
          button: "Export members as CSV";
        };
      };
      analytics: {
        title: "Analytics";
        analytics: {
          title: "Save and display page view analytics";
          description: "People with edit or full access will be able to see how many views a page has. If this is turned off, page views will not be stored for all pages in {{workspace}}.";
          hint: "Learn about workspace analytics.";
        };
      };
      danger: {
        title: "Danger zone";
        hint: "Learn about deleting workspaces.";
        delete: "Delete entire workspace";
        leave: "Leave workspace";
      };
      modals: {
        leave: {
          title: "Are you sure you want to leave this workspace?";
          primary: "Leave";
          secondary: "Cancel";
        };
      };
    };
    people: {
      title: "People";
      invite: {
        title: "Invite link to add members";
        description: "Only people with permission to invite members can see this. You can also <0>generate a new link</0>";
        button: "Copy link";
      };
      tabs: {
        members: "Members";
        guests: "Guests";
        groups: "Groups";
        search: "Type to search...";
        "add-members": "Add members";
      };
      upgrade: {
        title: "Upgrade to create groups";
        description: "Upgrade to the Plus Plan to set up groups and control permissions from the share menu.";
      };
      modals: {
        "reset-link": {
          title: "Are you sure you want to reset the invite link for all space members? Your old one will no longer be able to be used.";
          primary: "Reset";
          secondary: "Cancel";
        };
      };
    };
    teamspaces: {
      title: "Teamspaces";
    };
    plans: {
      title: "Explore plans";
      active: {
        title: "Active plan";
        plan: {
          free: {
            title: "Free";
            description: "For organizing every corner of your work and life";
            comment: "$0 per member / month";
          };
          education: {
            title: "Education Plus";
            description: "For students & educators";
            comment: "$0 per member / month";
          };
          plus: {
            title: "Plus";
            description: "A place for small groups to plan & get organized";
            comment: "$0 per member / month";
          };
          business: {
            title: "Business";
            description: "";
            comment: "";
          };
          enterprise: {
            title: "Enterprise";
            description: "";
            comment: "";
          };
        };
        ai: {
          title: "Notion AI";
          description: "Unlimited use of AI for Q&A, Autofill, Writer, and more";
          button: "Add to plan";
        };
      };
      "all-plans": {
        title: "All plans";
        description: "Questions about our plans? <0>Contact Sales</0>";
      };
      education: {
        title: "Students & educators";
        description: "Students and educators can get access to the Plus Plan features (with a 1-member limit) for free! Just sign up with your school email address, or change your existing email in the 'My account' tab. <0>For more info, go to notion.com/students.</0>";
        button: "Get the Education Plan";
      };
      faq: {
        title: "FAQ";
        description: "<0>Plans, Billing & Payment</0>";
        button: "Message support";
      };
    };
    billing: {
      title: "Billing";
    };
    "notion-ai": {
      title: "Notion AI";
      "notion-ai": {
        share: {
          title: "Share data to improve Notion AI";
          description: "Help improve Notion's AI models by allowing data from across this workspace to be shared with Notion. By enabling AI LEAP (Learning and Early Access Program) you are agreeing to the <0>Notion AI LEAP Supplementary Terms</0>. <1>Learn more</1>.";
        };
      };
    };
    sites: {
      title: "Sites";
    };
    emoji: {
      title: "Emoji";
    };
    security: {
      title: "Security";
      cards: {
        sso: {
          title: "Upgrade for SAML SSO & more admin tools";
          description: "The Business Plan includes single sign-on to manage employee access at scale, private teamspaces to collaborate on sensitive docs, and more.";
          action: "Upgrade to Business";
          more: "Learn more";
        };
        scim: {
          title: "Upgrade for SCIM, advanced security & more";
          description: "The Enterprise Plan allows you to automatically provision users and groups, and gain more visibility and controls across the workspace.";
          action: "Upgrade to Enterprise";
          more: "Learn more";
        };
      };
      general: {
        title: "General";
        publish: {
          title: "Disable publishing sites, forms, and public links";
          description: "Disable the “Publish site“ and “Anyone on the web with link“ options in the Share menu on every page and form in this workspace.";
        };
        duplicate: {
          title: "Disable duplicating pages to other workspaces";
          description: "Prevent anyone from duplicating pages to other workspaces via the Move To or Duplicate To actions.";
        };
        export: {
          title: "Disable export";
          description: "Prevent anyone from exporting as Markdown, CSV, or PDF.";
        };
      };
      invite: {
        title: "Inviting members & guests";
        access: {
          title: "Allow page access requests from non-members";
          description: "This allows anyone with the link to a page to request access. Workspace members can always request access.";
        };
        invite: {
          title: "Allow members to invite guests to pages";
          description_one: "Your workspace currently has <0>{{count}} guest</0>.";
          description_other: "Your workspace currently has <0>{{count}} guests</0>.";
        };
        guest: {
          title: "Allow members to request adding guests";
          description: "Requests must be approved by a workspace owner.";
        };
        member: {
          title: "Allow members to request adding other members";
          description: "Members can submit requests to admins to add more members.";
        };
        user: {
          title: "Allow any user to request to be added as a member of the workspace";
          description: "If enabled, users with teamspace invite links can submit requests to admins to be added as members.";
        };
      };
    };
    identity: {
      title: "Identity";
      domain: {
        title: "Domain management";
        domains: {
          title: "Verified domains";
          description: "Verify ownership of an email domain to access advanced security features including single-sign on.";
        };
        creation: {
          title: "Workspace creation";
          description: "Customize who can create new workspaces.";
        };
        claim: {
          title: "Claim workspaces";
          description: "Claim workspaces created by users with a verified domain or require owners to use an external domain.";
        };
      };
      user: {
        title: "User management";
        description: "These settings apply to all users with a verified domain, even if they are not a member of this workspace.";
        buttons: {
          hint: "Learn about managed users";
        };
        dashboard: {
          title: "Managed users dashboard";
          description: "Manage and view users that are using your verified domains.";
        };
        profile: {
          title: "Allow managed users to change profile information";
          description: "Control if managed users can change their preferred name, email address, and profile photo.";
        };
        external: {
          title: "External workspace access";
          description: "Control if managed users are able to join workspaces that aren't owned by your organization.";
        };
        support: {
          title: "Prevent managed users from granting support access";
          description: "Control if managed users can enable support access on their accounts.";
        };
        session: {
          title: "Session duration";
          description: "Control how long your managed users can be logged in for before they must re-authenticate.";
        };
        logout: {
          title: "Log out all users";
          description: "Force log out all managed users and require them to re-authenticate.";
        };
        password: {
          title: "Reset passwords for all users";
          description: "Force reset the passwords for all managed users and require them to create a new one the next time they log in.";
        };
        mail: {
          title: "Notion Mail";
          description: "Enable Notion Mail for all members under your company domains. By using Notion Mail, you agree to the Notion Mail and Notion AI Supplementary Terms.";
        };
      };
      saml: {
        title: "SAML Single sign-on (SSO)";
        buttons: {
          hint: "Learn about SAML SSO";
        };
        saml: {
          title: "Enable SAML SSO";
          description: "Workspace members can log in with SAML SSO if their email address uses a verified domain.";
        };
        login: {
          title: "Login method";
          description: "Customize how users access workspaces that have SAML SSO enabled. Workspace owners can always log in with a password.";
        };
        creation: {
          title: "Automatic account creation";
          description: "Automatically create Notion accounts for new users who log in via SAML SSO.";
        };
        linked: {
          title: "Linked workspaces";
          description: "This SAML SSO configuration applies to the following other workspaces. Contact support to add or remove a workspace.";
        };
      };
      scim: {
        title: "SCIM provisioning";
        scim: {
          title: "SCIM tokens";
          description: "Generate a token to configure SCIM.";
        };
      };
      setup: {
        title: "Setup information";
        "workspace-id": {
          description: "Workspace ID";
          tooltip: "Click to copy ID";
        };
      };
    };
    connections: {
      title: "Connections";
    };
    import: {
      title: "Import";
    };
  };
}

export default Resources;
