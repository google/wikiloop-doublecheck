import PureRevisionPanel from '~/components/PureRevisionPanel';
import ITEM_DATA_MAP from '~/test/testdata/mwapi/small/datamap.json';

function range(start, count) {
  return Array.apply(0, Array(count))
      .map((element, index) => index + start);
}

export default {
  title: 'PureRevisionPanel',
  component: PureRevisionPanel,
  argTypes: {
    itemKey: {
      control: {
        type: 'select',
        options: Object.keys(ITEM_DATA_MAP)
      },
      name: 'Revision',
      description: 'This control selects different revisions to be shown'
    }
  }
};

const Template = (args, { argTypes }) => ({
  components: { PureRevisionPanel },
  props: Object.keys(argTypes),
  template: '<PureRevisionPanel :infoLoaded="infoLoaded" :item="item" :diffLoaded="diffLoaded" />',
});

export const empty = Template.bind({});

empty.args = {
  infoLoaded: false,
};

export const basic = Template.bind({});
basic.args = {
  infoLoaded: true,
  diffLoaded: true,
  item: {
    wiki: 'enwiki',
    revId: 989699374,
    title: 'Human tooth sharpening',
    timestamp: '2019-07-01T21:49:32Z',
    author: '2601:5C2:1:5720:A5F4:BA9B:79B8:598C',
    summary: 'b hdhe ekjwjk eiqnq /* History */',
    diffHtml: '<tr>\n  <td colspan="2" class="diff-lineno">Line 52:</td>\n  <td colspan="2" class="diff-lineno">Line 52:</td>\n</tr>\n<tr>\n  <td class="diff-marker">&#160;</td>\n  <td class="diff-context"><div>[[Category:Forts in Japan]]</div></td>\n  <td class="diff-marker">&#160;</td>\n  <td class="diff-context"><div>[[Category:Forts in Japan]]</div></td>\n</tr>\n<tr>\n  <td class="diff-marker">&#160;</td>\n  <td class="diff-context"><div>[[Category:Osaka Castle]]</div></td>\n  <td class="diff-marker">&#160;</td>\n  <td class="diff-context"><div>[[Category:Osaka Castle]]</div></td>\n</tr>\n<tr>\n  <td class="diff-marker">−</td>\n  <td class="diff-deletedline"><div>[[Category:<del class="diffchange diffchange-inline">15th-century</del> establishments in Japan]]</div></td>\n  <td class="diff-marker">+</td>\n  <td class="diff-addedline"><div>[[Category:<ins class="diffchange diffchange-inline">1490s</ins> establishments in Japan]]</div></td>\n</tr>\n<tr>\n  <td class="diff-marker">&#160;</td>\n  <td class="diff-context"><div>[[Category:15th-century fortifications]]</div></td>\n  <td class="diff-marker">&#160;</td>\n  <td class="diff-context"><div>[[Category:15th-century fortifications]]</div></td>\n</tr>\n<tr>\n  <td class="diff-marker">&#160;</td>\n  <td class="diff-context"><div>[[Category:Rennyo]]</div></td>\n  <td class="diff-marker">&#160;</td>\n  <td class="diff-context"><div>[[Category:Rennyo]]</div></td>\n</tr>\n\n<!-- diff cache key enwiki:diff:wikidiff2:1.12:old-913912176:rev-920429244:1.10.0 -->\n',
  },
};

const SelectableTemplate = (args, context) => {
  return {
    components: { PureRevisionPanel },
    props: Object.keys(context.argTypes),
    template: '<PureRevisionPanel :infoLoaded="infoLoaded" :item="itemDataMap[itemKey]" :diffLoaded="diffLoaded" />',
    data() {
      return {
        itemDataMap: ITEM_DATA_MAP,
      };
    },
  };
};
export const selectable = SelectableTemplate.bind({});
selectable.args = {
  infoLoaded: true,
  diffLoaded: true,
  itemKey: Object.keys(ITEM_DATA_MAP)[0]
};

export const selectable2 = SelectableTemplate.bind({});
selectable2.args = {
  infoLoaded: true,
  diffLoaded: true,
  itemKey: Object.keys(ITEM_DATA_MAP)[1]
};