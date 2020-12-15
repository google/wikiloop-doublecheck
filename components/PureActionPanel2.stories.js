import PureActionPanel2 from '~/components/PureActionPanel2';

export default {
  title: 'PureActionPanel2',
  component: PureActionPanel2,
  argTypes: { 
    onRevert: { action: 'revert' },
    onJudgement: { action: 'judgement' },
    onNext: { action: 'next' },
  },
};

const Template = (args, { argTypes }) => ({
  components: { PureActionPanel2 },
  props: Object.keys(argTypes),
  template: 
    `<PureActionPanel2 
        @revert="onRevert"
        @judgement="onJudgement"
        @next="onNext"
        v-bind="$props"
    />`,
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

export const doneWithEligibleRevert = Template.bind({});
doneWithEligibleRevert.args = {
  selected: 'ShouldRevert',
  pending: false,
  eligibleForRevert: true,
};
export const doneWithFollowUpPending = Template.bind({});
doneWithFollowUpPending.args = {
  selected: 'ShouldRevert',
  pending: false,
  eligibleForRevert: true,
  followUpStatus: 'PENDING'
};
export const doneWithFollowUpDone = Template.bind({});
doneWithFollowUpDone.args = {
  selected: 'ShouldRevert',
  pending: false,
  eligibleForRevert: true,
  followUpStatus: 'DONE'
};

export const doneWithFollowUpError = Template.bind({});
doneWithFollowUpError.args = {
  selected: 'ShouldRevert',
  pending: false,
  eligibleForRevert: true,
  followUpStatus: 'ERROR'
};
