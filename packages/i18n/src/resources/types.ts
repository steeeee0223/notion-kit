interface Resources {
  settings: {
    settings: "Settings";
    common: {
      account: "Account";
      workspace: "Workspace";
      features: "Features";
      integrations: "Integrations";
      admin: "Admin";
      "access-and-billing": "Access & billing";
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
            fr: {
              label: "Français";
              description: "French";
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
          title: "Workspace content";
          description: "Export all pages in {{workspace}} as HTML, Markdown, CSV or PDF";
          button: "Export";
        };
        members: {
          title: "Members";
          description: "Export a list of members and guests in {{workspace}}";
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
        invitations: "Invitations";
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
      teamspaces: {
        title: "Teamspaces settings";
        info: {
          learn: "Learn about teamspaces";
        };
        default: {
          title: "Default teamspaces";
          description: "Choose teamspaces that all new and current workspace members will automatically join";
          button: "Update";
        };
        limit: {
          title: "Limit teamspace creation to only workspace owners";
          description: "Only allow workspace owners to create teamspaces";
        };
        manage: {
          title: "Manage teamspaces";
          description: "Manage all teamspaces you have access to here";
          button: "New teamspaces";
        };
      };
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
      plan: {
        title: "Plan";
        button: "Change plan";
      };
      "payment-details": {
        title: "Payment details";
        "payment-method": {
          title: "Payment method";
          none: "None";
          button: "Edit method";
        };
        "billed-to": {
          title: "Billed to";
          button: "Edit information";
        };
        "billing-email": {
          title: "Billing email";
          button: "Edit email";
        };
        "invoice-emails": {
          title: "Invoice emails";
          description: "Receive a copy of your invoice via email each billing period";
        };
        vat: {
          title: "VAT/GST number";
          none: "-";
          button: "Edit number";
        };
      };
      invoices: {
        title: "Invoices";
        upcoming: {
          title: "Upcoming invoice";
          button: "View invoice";
        };
      };
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
      limit: {
        title: "Limit custom emoji creation to workspace owners";
        description: "Any existing emojis can still be edited or deleted by the person who added them";
      };
      form: {
        "add-title": "Add custom emoji";
        "edit-title": "Edit custom emoji";
        description: "Custom emoji can be used by anyone in your workspace";
        upload: "Upload an image";
        replace: "Replace";
        "name-label": "Emoji name";
        "name-placeholder": "have-fun-with-it";
        preview: "Preview";
        cancel: "Cancel";
        save: "Save";
      };
    };
    tables: {
      emojis: {
        count_one: "{{count}} emoji";
        count_other: "{{count}} emojis";
        search: "Search by name or added by";
        "add-emoji": "Add emoji";
        empty: "Custom emoji are available for everyone in your workspace";
        delete: {
          title: "Delete this emoji?";
          description: "This will delete it for everyone in your workspace";
          primary: "Delete";
          secondary: "Cancel";
        };
        actions: {
          edit: "Edit";
          delete: "Delete";
        };
        columns: {
          image: "Image";
          name: "Name";
          "added-by": "Added by";
          "date-added": "Date added";
        };
      };
      connections: {
        columns: {
          connection: "Connection";
          access: "Access";
        };
        actions: {
          connect: "Connect another account";
          disconnect: "Disconnect account";
        };
      };
      people: {
        search: "Type to search...";
        empty: {
          members: "No members";
          guests: "No guests";
          groups: "No groups";
          invitations: "No invitations";
        };
        columns: {
          user: "User";
          teamspaces: "Teamspaces";
          groups: "Groups";
          role: "Role";
          access: "Access";
          status: "Status";
          "invited-by": "Invited by";
          members: "Members";
          group: "Group";
        };
        cells: {
          none: "None";
          "no-access": "No access";
          teamspaces_one: "{{count}} teamspace";
          teamspaces_other: "{{count}} teamspaces";
          members_one: "{{count}} member";
          members_other: "{{count}} members";
          pages_one: "{{count}} page";
          pages_other: "{{count}} pages";
          empty: "No results.";
        };
        actions: {
          "leave-workspace": "Leave workspace";
          "remove-from-workspace": "Remove from workspace";
          "upgrade-to-member": "Upgrade to member";
          "cancel-invitation": "Cancel invitation";
        };
        roles: {
          admin: "Admin";
          owner: "Workspace Owner";
          member: "Member";
          guest: "Guest";
        };
        "role-options": {
          owner: {
            label: "Workspace owner";
            description: "Can change workspace settings and invite new members to the workspace.";
          };
          member: {
            label: "Member";
            description: "Cannot change workspace settings or invite new members to the workspace.";
          };
        };
        statuses: {
          pending: "Pending";
          rejected: "Rejected";
          canceled: "Canceled";
        };
      };
      plans: {
        actions: {
          compare: "Compare all features";
          collapse: "Collapse";
          upgrade: "Upgrade";
          contact: "Contact sales";
        };
        highlight: {
          free: {
            title: "Free";
            description: "$0 per member / month";
          };
          plus: {
            title: "Plus";
            description: "$10 per member / month billed annually";
            subtext: "$12 billed monthly";
          };
          business: {
            title: "Business";
            description: "$15 per member / month billed annually";
            subtext: "$18 billed monthly";
          };
          enterprise: {
            title: "Enterprise";
            description: "Contact Sales for pricing";
          };
          tooltip: "Only workspace owners can perform this action.";
        };
      };
      sessions: {
        columns: {
          "device-name": "Device Name";
          "last-active": "Last Active";
          location: "Location";
        };
        actions: {
          logout: "Logout";
          "logout-confirm-title": "Log out of {{device}}?";
          "logout-confirm-desc": "You will be logged out of this device.";
        };
      };
      teamspaces: {
        columns: {
          teamspace: "Teamspace";
          owners: "Owners";
          access: "Access";
          updated: "Updated";
          user: "User";
          role: "Role";
        };
        roles: {
          owner: {
            label: "Teamspace owner";
            description: "Can edit teamspace settings and full access to teamspace pages.";
          };
          member: {
            label: "Teamspace member";
            description: "Cannot edit teamspace settings and can access teamspace pages.";
          };
        };
        actions: {
          settings: "Teamspace settings";
          leave: "Leave teamspace";
          archive: "Archive teamspace";
          remove: "Remove";
        };
        members: "members";
        joined: "Joined";
      };
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
    modals: {
      "delete-guest": {
        title: "Remove {{name}} from the workspace?";
        description: "They will lose access to all shared pages. To add them as a guest in the future, a request must be submitted, or an admin must invite them.";
        remove: "Remove";
        cancel: "Cancel";
      };
      "delete-member": {
        title: "Why are you removing this member from your workspace?";
        description: "We'd love your input to make Notion better";
        continue: "Continue";
        cancel: "Cancel";
        options: {
          "no-longer-need": "No longer need access to Notion";
          "not-using-enough": "Not using it enough";
          "too-expensive": "Too expensive";
          "switching-tool": "Switching to another tool";
          "no-longer-works": "No longer works here";
          "switching-workspace": "Switching to another Notion workspace";
          other: "Other";
        };
      };
      "logout-confirm": {
        logout: "Log out";
        cancel: "Cancel";
      };
      "delete-workspace": {
        title: "Delete this entire workspace permanently?";
        description: "This action cannot be undone. This will permanently delete the workspace, including all pages and files. Please type the name of the workspace to confirm.";
        validation: 'Please type "{{name}}" to continue';
        delete: "Permanently delete workspace";
        cancel: "Cancel";
      };
      "delete-account": {
        title: "Delete your entire account permanently?";
        description: "This action cannot be undone. This will permanently delete your entire account. All private workspaces will be deleted, and you will be removed from all shared workspaces.";
        label: "Please type in your email to confirm.";
        validation: 'Please type "{{email}}" to continue';
        delete: "Permanently delete account";
        cancel: "Cancel";
      };
      "leave-teamspace": {
        title: "Leave {{name}}?";
        description: "You’ll no longer see this teamspace in your sidebar and you may lose permissions to the teamspace’s pages.";
        remove: "Remove";
        cancel: "Cancel";
      };
      "email-settings": {
        description: "Your current email is <1>{{email}}</1>. We'll send a temporary verification code to this email.";
        send: "Send verification code";
      };
      "change-plan": {
        title: "Which plan do you want to change to?";
        description: "Pick one of the following Notion plans";
        continue: "Continue";
        cancel: "Cancel";
        plans: {
          free: "Free";
          plus: "Plus";
          business: "Business";
          enterprise: "Enterprise";
        };
        prices: {
          "per-member": "{{price}} per member / month";
          contact: "Contact Sales for pricing";
        };
      };
      "change-payment-method": {
        title: "Change your payment method";
        update: "Update";
        cancel: "Cancel";
      };
      "change-billing-email": {
        title: "Change billing email";
        update: "Update";
        cancel: "Cancel";
      };
      "add-members": {
        headings: {
          select: "Select a person";
          type: "Keep typing to invite email";
        };
        "search-placeholder": "Search name or emails";
        roles: {
          owner: "Workspace Owner";
          member: "Member";
          guest: "Guest";
        };
        invite: "Invite";
        empty: "Type or paste in emails above, separated by commas.";
        "learn-more": "Learn how to invite people and set permissions";
        "invited-badge": "Invited";
      };
      passkeys: {
        title: "Manage Passkeys";
        description: "Use your device's built-in security features like Face ID to sign in instead of remembering passwords.";
        error: "The passkey could not be saved; please try again.";
        active: "Active passkeys";
        add: "Add new passkey";
        cancel: "Cancel";
        "created-at": "Created at {{date}}";
        rename: "Rename passkey";
        delete: "Delete passkey";
      };
      "change-billing-address": {
        title: "Change your address";
        "business-name": "Business name (optional)";
        "full-name": "Full name";
        country: "Country or region";
        "postal-code": "Postal code";
        update: "Update";
        cancel: "Cancel";
      };
      "add-team-members": {
        headings: {
          select: "Select a person";
          type: "Keep typing to invite member";
        };
        "title-prefix": "Invite people to";
        "search-placeholder": "Search people or groups";
        "no-results": "No results found";
        invited: "Invited";
        roles: {
          owner: "Teamspace owner";
          member: "Teamspace member";
        };
        "copy-link": "Copy invite link";
        invite: "Invite";
      };
      "2fa": {
        "add-form": {
          required: "Required";
          title: "To continue, we need to verify your identity";
          "password-placeholder": "Your password";
          continue: "Continue";
          forgot: "Forgot password";
          "email-sent": "A password reset link has been sent to {{email}}.";
        };
        "enable-method": {
          title: "Turn on 2-step verification";
          description: "Confirm it's you when you use a password with a verification code";
          authenticator: {
            title: "Code from authenticator";
            description: "Generate a one-time code in your authenticator app";
          };
          text: {
            title: "Text me a code";
            description: "Add and verify your phone number";
          };
        };
      };
      "teamspace-detail": {
        tabs: {
          general: "General";
          members: "Members";
          security: "Security";
        };
        joined: "Joined";
        join: "Join";
        general: {
          "details-title": "Details";
          "icon-name": "Icon and name";
          description: "Description";
          "no-description": "No description";
          "permissions-title": "Permissions";
          "danger-zone-title": "Danger zone";
          leave: "Leave teamspace";
          "leave-description": "Removes teamspace from your sidebar";
          "learn-more": "Learn about teamspaces";
        };
        security: {
          title: "Teamspace Security";
          "learn-more": "Learn about teamspace security";
        };
        members: {
          "permissions-title": "Permissions";
          "learn-more-permissions": "Learn about teamspace permissions";
          "members-title": "Members";
          "add-members": "Add members";
          "copy-link": "Copy link";
          "search-placeholder": "Search for members or groups";
        };
      };
      upgrade: {
        title: "Upgrade to the {{plan}} plan";
        "billing-details": {
          "name-label": "Name";
          "name-placeholder": "Ada Lovelace";
          "business-name-label": "Business name (optional)";
          "business-name-placeholder": "Acme Inc.";
          "vat-label": "VAT/GST number (optional)";
          "vat-placeholder": "123456789";
        };
        "payment-section": {
          title: "Payment method";
        };
        "billing-options": {
          title: "Billing options";
          monthly: "Pay monthly";
          "monthly-desc": "${{price}} / month / member";
          annually: "Pay annually";
          "annually-desc": "${{price}} / month / member";
          "save-badge": "Save 17%";
        };
        confirm: {
          title: "Confirm upgrade";
          "per-month": "/ month";
          "terms-description": "Your Notion subscription will auto-renew each {{interval}} at the above price per seat + taxes unless canceled. Cancel via the Billing tab prior to renewal to avoid future charges ( <1>terms</1> )";
          submit: "Upgrade to {{plan}}";
        };
      };
      "create-teamspace": {
        title: "Create a new teamspace";
        description: "Teamspaces are where your team organizes pages, permissions, and members";
        "icon-name": "Icon & name";
        "name-placeholder": "Acme Labs";
        "description-label": "Description";
        "description-placeholder": "Details about your teamspace";
        permissions: "Permissions";
        "learn-more": "Learn about teamspaces";
        submit: "Create teamspace";
      };
      password: {
        errors: {
          unique: "Please include additional unique characters.";
          mismatch: "Your new password does not match.";
        };
        "title-change": "Change password";
        "title-set": "Set a password";
        description: "Use a password at least 15 letters long, or at least 8 characters long with both letters and numbers. If you lose access to your school email address, you'll be able to log in using your password.";
        "current-label": "Enter your current password";
        "current-placeholder": "Current password";
        "new-label": "Enter a new password";
        "new-placeholder": "New password";
        "confirm-label": "Confirm your new password";
        "confirm-placeholder": "Confirm password";
        "success-title": "Your password has been saved";
        "success-description": "You'll be able to log in, even if you lose access to your school email address.";
      };
    };
  };
}

export default Resources;
