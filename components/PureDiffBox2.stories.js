import PureDiffBox2 from '~/components/PureDiffBox2';

export default {
  title: 'PureDiffBox2',
  component: PureDiffBox2,
}

const Template = (args, { argTypes }) => ({
  components: { PureDiffBox2 },
  props: Object.keys(argTypes),
  template: '<PureDiffBox2 :loaded="loading" :diffSafeHtml="diffSafeHtml" />',
  // TODO i18n wait for https://github.com/nuxt-community/storybook/commit/7588841242d9d17c89e7c5075f4a5ce8330fdcf5
});


export const empty = Template.bind({});
empty.args = {
  loaded: true,
  diffSafeHtml: ``,
};

export const basic = Template.bind({});
basic.args = {
  loaded: true,
  diffSafeHtml: `<tr>
  <td colspan="2" class="diff-lineno">Line 32:</td>
  <td colspan="2" class="diff-lineno">Line 32:</td>
</tr>
<tr>
  <td class="diff-marker">&#160;</td>
  <td class="diff-context"><div>}}</div></td>
  <td class="diff-marker">&#160;</td>
  <td class="diff-context"><div>}}</div></td>
</tr>
<tr>
  <td class="diff-marker">&#160;</td>
  <td class="diff-context"><div>{{Tibetan Buddhism}}</div></td>
  <td class="diff-marker">&#160;</td>
  <td class="diff-context"><div>{{Tibetan Buddhism}}</div></td>
</tr>
<tr>
  <td class="diff-marker">−</td>
  <td class="diff-deletedline"><div>'''Dzogchen Monastery''' (Tib. རྫོགས་ཆེན་དགོན། ''rdzogs chen dgon'') is one of the<del class="diffchange diffchange-inline"> six great</del> [[<del class="diffchange diffchange-inline">monastery</del>|<del class="diffchange diffchange-inline">monasteries</del>]] of the [[Nyingma]] tradition of [[Tibetan Buddhism]]. It is located in [[Kham]] within modern day [[Dêgê County]], [[Garzê Tibetan Autonomous Prefecture]], [[Sichuan]], [[China]].</div></td>
  <td class="diff-marker">+</td>
  <td class="diff-addedline"><div>'''Dzogchen Monastery''' (Tib. རྫོགས་ཆེན་དགོན། ''rdzogs chen dgon'') is one of the [[<ins class="diffchange diffchange-inline">Nyingma#"Six Mother Monasteries"</ins>|<ins class="diffchange diffchange-inline">"Six Mother Monasteries"</ins>]] of the [[Nyingma]] tradition of [[Tibetan Buddhism]]. It is located in [[Kham]] within modern day [[Dêgê County]], [[Garzê Tibetan Autonomous Prefecture]], [[Sichuan]], [[China]].</div></td>
</tr>
<tr>
  <td class="diff-marker">&#160;</td>
  <td class="diff-context"></td>
  <td class="diff-marker">&#160;</td>
  <td class="diff-context"></td>
</tr>
<tr>
  <td class="diff-marker">&#160;</td>
  <td class="diff-context"><div>==History==</div></td>
  <td class="diff-marker">&#160;</td>
  <td class="diff-context"><div>==History==</div></td>
</tr>

<!-- diff cache key enwiki:diff:wikidiff2:1.12:old-946272067:rev-976551791:1.10.0 -->`,
};

export const loading = Template.bind({});
loading.args = {
  loaded: false,
  diffSafeHtml: `<tr>
  <td class="diff-marker">&#160;</td>
  <td class="diff-context"><div>}}</div></td>
  <td class="diff-marker">&#160;</td>
  <td class="diff-context"><div>}}</div></td>
</tr>`
};

export const beforeLoading = Template.bind({});
beforeLoading.args = {
  loaded: false
};

