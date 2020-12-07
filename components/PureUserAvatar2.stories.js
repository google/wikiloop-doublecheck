import PureUserAvatar2 from '~/components/PureUserAvatar2';

export default {
  title: 'PureUserAvatar2',
  component: PureUserAvatar2,
};

const Template = (args, { argTypes }) => ({
  components: { PureUserAvatar2 },
  props: Object.keys(argTypes),
  template: `<PureUserAvatar2
    :userName="userName"
    :userGaId="userGaId"
  />`,
});

export const basic = Template.bind({});

basic.args = {
  userName: 'Xinbenlv',
  userGaId: 'GA1.2.1021694750.1607134727',
};

export const gaId = Template.bind({});

gaId.args = {
  userGaId: 'GA1.2.1021694750.1607134727',
};
