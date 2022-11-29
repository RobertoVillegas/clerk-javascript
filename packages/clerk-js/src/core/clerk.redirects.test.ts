import Clerk from './clerk';
import { Client, DisplayConfig, Environment } from './resources/internal';

const mockClientFetch = jest.fn();
const mockEnvironmentFetch = jest.fn();

jest.mock('./resources/Client');
jest.mock('./resources/Environment');

// Because Jest, don't ask me why...
jest.mock('./devBrowserHandler', () => () => ({
  clear: jest.fn(),
  setup: jest.fn(),
  getDevBrowserJWT: jest.fn(() => 'db_deadbeef'),
  setDevBrowserJWT: jest.fn(),
  removeDevBrowserJWT: jest.fn(),
}));

Client.getInstance = jest.fn().mockImplementation(() => {
  return { fetch: mockClientFetch };
});
Environment.getInstance = jest.fn().mockImplementation(() => {
  return { fetch: mockEnvironmentFetch };
});

const oldWindowLocation = window.location;

const mockDisplayConfigWithSameOrigin = {
  signInUrl: 'http://test.host/sign-in',
  signUpUrl: 'http://test.host/sign-up',
  userProfileUrl: 'http://test.host/user-profile',
  homeUrl: 'http://test.host/home',
  createOrganizationUrl: 'http://test.host/create-organization',
  organizationProfileUrl: 'http://test.host/organization-profile',
} as DisplayConfig;

const mockDisplayConfigWithDifferentOrigin = {
  signInUrl: 'http://another-test.host/sign-in',
  signUpUrl: 'http://another-test.host/sign-up',
  userProfileUrl: 'http://another-test.host/user-profile',
  homeUrl: 'http://another-test.host/home',
  createOrganizationUrl: 'http://another-test.host/create-organization',
  organizationProfileUrl: 'http://another-test.host/organization-profile',
} as DisplayConfig;

const developmentFrontendApi = 'clerk.abcef.12345.dev.lclclerk.com';
const productionFrontendApi = 'clerk.abcef.12345.prod.lclclerk.com';

describe('Clerk singleton - Redirects', () => {
  let mockNavigate = jest.fn();
  let mockWindowLocation;
  let mockHref: jest.Mock;

  beforeEach(() => {
    mockHref = jest.fn();
    mockWindowLocation = {
      host: 'test.host',
      hostname: 'test.host',
      origin: 'http://test.host',
      get href() {
        return 'http://test.host';
      },
      set href(v: string) {
        mockHref(v);
      },
    } as any;

    Object.defineProperty(global.window, 'location', { value: mockWindowLocation });
  });

  afterAll(() => {
    Object.defineProperty(global.window, 'location', {
      value: oldWindowLocation,
    });
  });

  beforeEach(() => {
    mockClientFetch.mockReturnValue(
      Promise.resolve({
        activeSessions: [],
      }),
    );

    mockNavigate = jest.fn((to: string) => Promise.resolve(to));
  });

  describe('.redirectTo(SignUp|SignIn|UserProfile|Home|CreateOrganization|OrganizationProfile)', () => {
    let clerkForProductionInstance: Clerk;
    let clerkForDevelopmentInstance: Clerk;

    describe('when redirects point to same origin urls', () => {
      beforeEach(async () => {
        mockEnvironmentFetch.mockReturnValue(
          Promise.resolve({
            authConfig: {},
            displayConfig: mockDisplayConfigWithSameOrigin,
          }),
        );

        clerkForProductionInstance = new Clerk(productionFrontendApi);
        await clerkForProductionInstance.load({
          navigate: mockNavigate,
          __experimental__devSessionSyncMode: 'cookieless',
        });

        clerkForDevelopmentInstance = new Clerk(developmentFrontendApi);
        await clerkForDevelopmentInstance.load({
          navigate: mockNavigate,
          __experimental__devSessionSyncMode: 'cookieless',
        });
      });

      it('redirects to signInUrl', async () => {
        await clerkForProductionInstance.redirectToSignIn({ redirectUrl: 'https://www.example.com/' });
        expect(mockNavigate).toHaveBeenNthCalledWith(1, '/sign-in#/?redirect_url=https%3A%2F%2Fwww.example.com%2F');

        await clerkForDevelopmentInstance.redirectToSignIn({ redirectUrl: 'https://www.example.com/' });
        expect(mockNavigate).toHaveBeenNthCalledWith(2, '/sign-in#/?redirect_url=https%3A%2F%2Fwww.example.com%2F');
      });

      it('redirects to signUpUrl', async () => {
        await clerkForProductionInstance.redirectToSignUp({ redirectUrl: 'https://www.example.com/' });
        expect(mockNavigate).toHaveBeenNthCalledWith(1, '/sign-up#/?redirect_url=https%3A%2F%2Fwww.example.com%2F');

        await clerkForDevelopmentInstance.redirectToSignUp({ redirectUrl: 'https://www.example.com/' });
        expect(mockNavigate).toHaveBeenNthCalledWith(2, '/sign-up#/?redirect_url=https%3A%2F%2Fwww.example.com%2F');
      });

      it('redirects to userProfileUrl', async () => {
        await clerkForProductionInstance.redirectToUserProfile();
        expect(mockNavigate).toHaveBeenNthCalledWith(1, '/user-profile');

        await clerkForDevelopmentInstance.redirectToUserProfile();
        expect(mockNavigate).toHaveBeenNthCalledWith(2, '/user-profile');
      });

      it('redirects to home', async () => {
        await clerkForProductionInstance.redirectToHome();
        expect(mockNavigate).toHaveBeenNthCalledWith(1, '/home');

        await clerkForDevelopmentInstance.redirectToHome();
        expect(mockNavigate).toHaveBeenNthCalledWith(2, '/home');
      });

      it('redirects to create organization', async () => {
        await clerkForProductionInstance.redirectToCreateOrganization();
        expect(mockNavigate).toHaveBeenNthCalledWith(1, '/create-organization');

        await clerkForDevelopmentInstance.redirectToCreateOrganization();
        expect(mockNavigate).toHaveBeenNthCalledWith(2, '/create-organization');
      });

      it('redirects to organization profile', async () => {
        await clerkForProductionInstance.redirectToOrganizationProfile();
        expect(mockNavigate).toHaveBeenNthCalledWith(1, '/organization-profile');

        await clerkForDevelopmentInstance.redirectToOrganizationProfile();
        expect(mockNavigate).toHaveBeenNthCalledWith(2, '/organization-profile');
      });
    });

    describe('when redirects point to different origin urls', () => {
      beforeEach(async () => {
        mockEnvironmentFetch.mockReturnValue(
          Promise.resolve({
            authConfig: {},
            displayConfig: mockDisplayConfigWithDifferentOrigin,
          }),
        );

        clerkForProductionInstance = new Clerk(productionFrontendApi);
        await clerkForProductionInstance.load({
          navigate: mockNavigate,
          __experimental__devSessionSyncMode: 'cookieless',
        });

        clerkForDevelopmentInstance = new Clerk(developmentFrontendApi);
        await clerkForDevelopmentInstance.load({
          navigate: mockNavigate,
          __experimental__devSessionSyncMode: 'cookieless',
        });
      });

      it('redirects to signInUrl', async () => {
        await clerkForProductionInstance.redirectToSignIn({ redirectUrl: 'https://www.example.com/' });
        expect(mockHref).toHaveBeenNthCalledWith(
          1,
          'http://another-test.host/sign-in#/?redirect_url=https%3A%2F%2Fwww.example.com%2F',
        );

        await clerkForDevelopmentInstance.redirectToSignIn({ redirectUrl: 'https://www.example.com/' });
        expect(mockHref).toHaveBeenNthCalledWith(
          2,
          'http://another-test.host/sign-in#/?redirect_url=https%3A%2F%2Fwww.example.com%2F&__dev_session=db_deadbeef',
        );
      });

      it('redirects to signUpUrl', async () => {
        await clerkForProductionInstance.redirectToSignUp({ redirectUrl: 'https://www.example.com/' });
        expect(mockHref).toHaveBeenNthCalledWith(
          1,
          'http://another-test.host/sign-up#/?redirect_url=https%3A%2F%2Fwww.example.com%2F',
        );

        await clerkForDevelopmentInstance.redirectToSignUp({ redirectUrl: 'https://www.example.com/' });
        expect(mockHref).toHaveBeenNthCalledWith(
          2,
          'http://another-test.host/sign-up#/?redirect_url=https%3A%2F%2Fwww.example.com%2F&__dev_session=db_deadbeef',
        );
      });

      it('redirects to userProfileUrl', async () => {
        await clerkForProductionInstance.redirectToUserProfile();
        expect(mockHref).toHaveBeenNthCalledWith(1, 'http://another-test.host/user-profile');

        await clerkForDevelopmentInstance.redirectToUserProfile();
        expect(mockHref).toHaveBeenNthCalledWith(
          2,
          'http://another-test.host/user-profile#/?__dev_session=db_deadbeef',
        );
      });

      it('redirects to home', async () => {
        await clerkForProductionInstance.redirectToHome();
        expect(mockHref).toHaveBeenNthCalledWith(1, 'http://another-test.host/home');

        await clerkForDevelopmentInstance.redirectToHome();
        expect(mockHref).toHaveBeenNthCalledWith(2, 'http://another-test.host/home#/?__dev_session=db_deadbeef');
      });

      it('redirects to create organization', async () => {
        await clerkForProductionInstance.redirectToCreateOrganization();
        expect(mockHref).toHaveBeenNthCalledWith(1, 'http://another-test.host/create-organization');

        await clerkForDevelopmentInstance.redirectToCreateOrganization();
        expect(mockHref).toHaveBeenNthCalledWith(
          2,
          'http://another-test.host/create-organization#/?__dev_session=db_deadbeef',
        );
      });

      it('redirects to organization profile', async () => {
        await clerkForProductionInstance.redirectToOrganizationProfile();
        expect(mockHref).toHaveBeenNthCalledWith(1, 'http://another-test.host/organization-profile');

        await clerkForDevelopmentInstance.redirectToOrganizationProfile();
        expect(mockHref).toHaveBeenNthCalledWith(
          2,
          'http://another-test.host/organization-profile#/?__dev_session=db_deadbeef',
        );
      });
    });
  });

  describe('.redirectWithAuth(url)', () => {
    let clerkForProductionInstance: Clerk;
    let clerkForDevelopmentInstance: Clerk;

    describe('for cookie-based dev instances', () => {
      beforeEach(async () => {
        clerkForProductionInstance = new Clerk(productionFrontendApi);
        await clerkForProductionInstance.load({
          navigate: mockNavigate,
          __experimental__devSessionSyncMode: 'cookie',
        });

        clerkForDevelopmentInstance = new Clerk(developmentFrontendApi);
        await clerkForDevelopmentInstance.load({
          navigate: mockNavigate,
          __experimental__devSessionSyncMode: 'cookie',
        });
      });

      it('redirects to the provided url without __dev_session in the url', async () => {
        await clerkForProductionInstance.redirectWithAuth('https://app.example.com');
        expect(mockHref).toHaveBeenNthCalledWith(1, 'https://app.example.com/');

        await clerkForDevelopmentInstance.redirectWithAuth('https://app.example.com');
        expect(mockHref).toHaveBeenNthCalledWith(2, 'https://app.example.com/');
      });
    });

    describe('for cookieless dev instances', () => {
      beforeEach(async () => {
        clerkForProductionInstance = new Clerk(productionFrontendApi);
        await clerkForProductionInstance.load({
          navigate: mockNavigate,
          __experimental__devSessionSyncMode: 'cookieless',
        });

        clerkForDevelopmentInstance = new Clerk(developmentFrontendApi);
        await clerkForDevelopmentInstance.load({
          navigate: mockNavigate,
          __experimental__devSessionSyncMode: 'cookieless',
        });
      });

      it('redirects to the provided url with __dev_session in the url', async () => {
        await clerkForProductionInstance.redirectWithAuth('https://app.example.com');
        expect(mockHref).toHaveBeenNthCalledWith(1, 'https://app.example.com/');

        await clerkForDevelopmentInstance.redirectWithAuth('https://app.example.com');
        expect(mockHref).toHaveBeenNthCalledWith(2, 'https://app.example.com/#/?__dev_session=db_deadbeef');
      });
    });
  });
});