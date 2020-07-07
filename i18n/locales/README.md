## Locales
This folder contains the i18n messages for this software project. 

## Directory Structure
Each locale file is named as `<iso-639-1 language code>.yml`. See [List of Wikipedias](https://en.wikipedia.org/wiki/List_of_Wikipedias).

## Schema
Due to the [current limitation of vue-i18n](https://github.com/intlify/vue-i18n-next/issues/71), there is no offical schema to include metadata such as descriptions. We are going to create our own schema at this moment to contain the descriptions etc.

We currently support the following 3 metadata.

<!-- TODO(xinbenlv): add machine-translated annotation in `npm run translate` -->

```typescript
interface LocaleMeta {
  description: string
  translator: string
  translatedAt: date
  isMachineTranslated: boolean
}

```

Here is an example

```yml
# file: en.yml
Label-SomeLabel: Here is some label.
Label-SomeLabel.@meta.@description: A longer description of what Label-SomeLabel does. Please note there is a period sign at the end. 

# file: zh.yml
Label-SomeLabel: 这里有一些标签。
Label-SomeLabel.@meta.@description: 关于Label-SomeLabel的更长的一个解释。请注意结尾有一个句号。
Label-SomeLabel.@meta.@translator: Xinbenlv
Label-SomeLabel.@meta.@isMachineTranslated: false
Label-SomeLabel.@meta.@translatedAt: 2020-07-07 17:30:00 UTC
```

The key design decision here is we decided to include the metadata as a postfix for the sting being annotated. 
This allow us to have the following benefit

1. From day 1 work with existing tooling such as [i18n-ally](https://github.com/antfu/i18n-ally) for best tool compatibility
2. Allow native speakers to see the machine translated explanation (the longer description) so they don't need 100% understanding of source language.

## Generating machine translation for new UI strings

```shell
npm run translate
```

Remember to include a `private-key.json` from [Google Cloud Console](https://console.cloud.google.com/) with a [service account](https://cloud.google.com/iam/docs/understanding-service-accounts) enabled for [Google Cloud Translation API](https://cloud.google.com/translate) service.

