import PureActionPanel2 from '~/components/PureActionPanel2';

export default {
  title: 'PureActionPanel2',
  component: PureActionPanel2,
};

const Template = (args, { argTypes }) => ({
  components: { PureActionPanel2 },
  props: Object.keys(argTypes),
  template: '<PureActionPanel2 :selected="selected" :pending="pending"/>',
});

export const basic = Template.bind({});
basic.args = {
  selected: null,
  pending: false,
};

export const pending = Template.bind({});
pending.args = {
  selected: 'ShouldRevert',
  pending: true,
};

export const done = Template.bind({});
done.args = {
  selected: 'ShouldRevert',
  pending: false,
};
