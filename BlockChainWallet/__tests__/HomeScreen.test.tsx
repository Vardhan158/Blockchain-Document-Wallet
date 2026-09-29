import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { HomeScreen } from '../src/screens/HomeScreen';
const mockFetch = jest.fn().mockResolvedValue(undefined);
const mockDocumentState = {
  documents: [] as any[],
  fetchDocuments: mockFetch,
  isLoading: false,
  error: null,
};
jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
}));
jest.mock('react-native-qrcode-svg', () => 'QRCode');
jest.mock('../src/components/DashboardArtwork', () => ({
  GradientSurface: () => null,
  VaultFolder: () => null,
  VaultIcon: () => null,
}));
jest.mock('../src/components/OfflineBanner', () => ({
  OfflineBanner: () => null,
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 24, bottom: 16, left: 0, right: 0 }),
}));
jest.mock('@react-navigation/native', () => ({ useFocusEffect: () => {} }));
jest.mock('../src/store/useAuthStore', () => ({
  useAuthStore: (selector: any) =>
    selector({
      user: { fullName: 'Harsha Rao', userId: 'BDW-FR22RXC', isVerified: true },
      fetchProfile: mockFetch,
    }),
}));
jest.mock('../src/store/useDocumentStore', () => ({
  useDocumentStore: () => mockDocumentState,
}));
jest.mock('../src/store/useNotificationStore', () => ({
  useNotificationStore: () => ({
    unreadCount: 2,
    fetchNotifications: mockFetch,
  }),
}));
const content = (node: Renderer.ReactTestInstance): string =>
  node
    .findAllByType(Text)
    .map(n => n.props.children)
    .flat(Infinity)
    .join('');
let tree: Renderer.ReactTestRenderer;
const navigate = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  mockDocumentState.documents = [];
});
afterEach(() => {
  act(() => tree.unmount());
});
async function render() {
  await act(async () => {
    tree = Renderer.create(
      <HomeScreen
        navigation={{ navigate } as any}
        route={{ key: 'home', name: 'Home' }}
      />,
    );
  });
}
function press(label: string) {
  const button = tree.root
    .findAllByType(TouchableOpacity)
    .find(n => content(n) === label);
  expect(button).toBeDefined();
  act(() => button!.props.onPress());
}
it('copies the actual public ID, opens its QR, and routes upload', async () => {
  await render();
  press('Copy ID');
  expect(Clipboard.setString).toHaveBeenCalledWith('BDW-FR22RXC');
  press('Show QR');
  expect(tree.root.findByType('QRCode' as any).props.value).toBe('BDW-FR22RXC');
  press('Upload Document');
  expect(navigate).toHaveBeenCalledWith('Upload');
});
it('filters live counts by document category and includes under-review in pending', async () => {
  mockDocumentState.documents = [
    {
      id: '1',
      title: 'License',
      documentType: 'DRIVING_LICENSE',
      approvedTag: 'VEHICLE',
      status: 'UNDER_REVIEW',
      updatedAt: '2026-09-28',
    },
    {
      id: '2',
      title: 'Passport',
      documentType: 'PASSPORT',
      approvedTag: 'NORMAL',
      status: 'APPROVED',
      updatedAt: '2026-09-27',
    },
  ];
  await render();
  expect(
    tree.root
      .findAllByType(TouchableOpacity)
      .some(n => n.props.accessibilityLabel === 'Pending: 1. View documents'),
  ).toBe(true);
  press('All Documents');
  press('Vehicle Documents');
  expect(
    tree.root
      .findAllByType(TouchableOpacity)
      .some(
        n =>
          n.props.accessibilityLabel === 'Total Documents: 1. View documents',
      ),
  ).toBe(true);
  expect(
    tree.root
      .findAllByType(TouchableOpacity)
      .some(n => n.props.accessibilityLabel === 'Approved: 0. View documents'),
  ).toBe(true);
});
