import { createHash } from 'crypto';
import { parse as parseSFC } from '@vue/compiler-sfc'
import { parse as parseDOM, transform, NodeTypes } from '@vue/compiler-dom'


function buildAttribute(tag, node, props) {

  const tagName = tag.match(/[ \w-]+?(?=\.)/)[0].toLowerCase();
  const attributeValue = createHash('sha256')
    .update(props.loc.source)
    .digest('hex')
    .slice(0, 8);
  return tagName + "-" + node.tag.toLowerCase() + "-" + attributeValue;
}

function addAttrPatch(el, tplStartOffset, name, value) {
  // Skip if it already has static or dynamic data-id
  const hasStatic = el.props.some(p => p.type === NodeTypes.ATTRIBUTE && p.name === name)
  const hasDynamic = el.props.some(
    p =>
      p.type === NodeTypes.DIRECTIVE &&
      p.name === 'bind' &&
      p.arg &&
      p.arg.type === 4 &&
      p.arg.content === name
  )
  if (hasStatic || hasDynamic) return null

  // Get the element’s source and find the end of the opening tag
  const src = el.loc.source
  const gtIndex = src.indexOf('>')
  if (gtIndex < 0) return null

  // Handle self-closing tags like <MyComp />
  const insertAt = (gtIndex > 0 && src[gtIndex - 1] === '/') ? gtIndex - 1 : gtIndex

  const openStartGlobal = tplStartOffset + el.loc.start.offset
  const patchStart = openStartGlobal + insertAt
  const text = ` ${name}="${value}"`

  return { start: patchStart, end: patchStart, text }
}

function applyPatches(original, patches) {
  // Apply patches right-to-left to avoid shifting indexes
  patches.sort((a, b) => b.start - a.start)
  let out = original
  for (const p of patches) {
    out = out.slice(0, p.start) + p.text + out.slice(p.end)
  }
  return out
}

export function addTestIds() {
  return {
    name: 'vue-template-attr-inject',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.vue')) return

      const { descriptor } = parseSFC(code)
      const block = descriptor.template
      if (!block) return

      // Absolute offset of the <template> inner HTML within the full file
      const tplInnerStart = block.loc.start.offset
      const innerStart = tplInnerStart + block.loc.source.indexOf(block.content)

      const ast = parseDOM(block.content, { comments: true, whitespace: 'preserve' })

      const patches = []
      const idAttribute = "data-pa-testid";
      transform(ast, {
        nodeTransforms: [
          node => {
            let patch = null;

            if(node.props) {
              const attrValue = node.props.find((prop) =>  {
                return prop.rawName === '@click' || prop.rawName === 'v-model' || prop.rawName === 'modelValue'
              });
              if(attrValue) {
                patch = addAttrPatch(node, innerStart, idAttribute, buildAttribute(id, node, attrValue))
              }

            }

            if (patch) {
              patches.push(patch)
            }

          }
        ]
      })

      if (patches.length === 0) return

      const newCode = applyPatches(code, patches)
      console.log(newCode, 'here')
      return { code: newCode, map: null }
    }
  }
}
