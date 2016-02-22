import {resolveForwardRef, Injectable} from 'angular2/src/core/di';
import {Type, isPresent, isBlank, stringify} from 'angular2/src/facade/lang';
import {BaseException} from 'angular2/src/facade/exceptions';
import {ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';

import {
DirectiveMetadata,
ComponentMetadata,
InputMetadata,
OutputMetadata,
HostBindingMetadata,
HostListenerMetadata,
ContentChildrenMetadata,
ViewChildrenMetadata,
ContentChildMetadata,
ViewChildMetadata
} from 'angular2/src/core/metadata';
import {reflector} from 'angular2/src/core/reflection/reflection';

function _isDirectiveMetadata(type: any): boolean {
  let className: string = type.constructor.toString().match(/\w+/g)[1];
  return className === 'DirectiveMetadata';
}

function _isComponentMetadata(type: any): boolean {
  let className: string = type.constructor.toString().match(/\w+/g)[1];
  return className === 'ComponentMetadata';
}

/*
 * Resolve a `Type` for {@link DirectiveMetadata}.
 *
 * This interface can be overridden by the application
 developer to create custom behavior.
 *
 * See {@link Compiler}
 */
@Injectable()
export class DirectiveResolver {
  /**
   * Return {@link DirectiveMetadata} for a given `Type`.
   */
  resolve(type: Type): DirectiveMetadata {
    let typeMetadata: any = reflector.annotations(resolveForwardRef(type));

    if (isPresent(typeMetadata)) {
      let metadata = typeMetadata.find(_isDirectiveMetadata) ||
                     typeMetadata.find(_isComponentMetadata);
      if (isPresent(metadata)) {
        let propertyMetadata = reflector.propMetadata(type);
        return this._mergeWithPropertyMetadata
          (metadata, propertyMetadata, type);
      }
    }

    throw new BaseException(`No Directive annotation
       found on ${stringify(type)}`);
  }

  private _mergeWithPropertyMetadata(dm: DirectiveMetadata,
    propertyMetadata: { [key: string]: any[] },
    directiveType: Type): DirectiveMetadata {
    let inputs = [];
    let outputs = [];
    let host: { [key: string]: string } = {};
    let queries: { [key: string]: any } = {};

    StringMapWrapper.forEach(propertyMetadata,
      (metadata: any[], propName: string) => {
      metadata.forEach(a => {
        if (a instanceof InputMetadata) {
          if (isPresent(a.bindingPropertyName)) {
            inputs.push(`${propName}: ${a.bindingPropertyName}`);
          } else {
            inputs.push(propName);
          }
        }

        if (a instanceof OutputMetadata) {
          if (isPresent(a.bindingPropertyName)) {
            outputs.push(`${propName}: ${a.bindingPropertyName}`);
          } else {
            outputs.push(propName);
          }
        }

        if (a instanceof HostBindingMetadata) {
          if (isPresent(a.hostPropertyName)) {
            host[`[${a.hostPropertyName}]`] = propName;
          } else {
            host[`[${propName}]`] = propName;
          }
        }

        if (a instanceof HostListenerMetadata) {
          let args = isPresent(a.args) ? (<any[]>a.args).join(', ') : '';
          host[`(${a.eventName})`] = `${propName}(${args})`;
        }

        if (a instanceof ContentChildrenMetadata) {
          queries[propName] = a;
        }

        if (a instanceof ViewChildrenMetadata) {
          queries[propName] = a;
        }

        if (a instanceof ContentChildMetadata) {
          queries[propName] = a;
        }

        if (a instanceof ViewChildMetadata) {
          queries[propName] = a;
        }
      });
    });
    return this._merge(dm, inputs, outputs, host, queries, directiveType);
  }

  private _merge(dm: DirectiveMetadata, inputs: string[], outputs: string[],
    host: { [key: string]: string }, queries: { [key: string]: any },
    directiveType: Type): DirectiveMetadata {
    let mergedInputs = isPresent(dm.inputs) ?
      ListWrapper.concat(dm.inputs, inputs) : inputs;

    let mergedOutputs;
    if (isPresent(dm.outputs)) {
      dm.outputs.forEach((propName: string) => {
        if (ListWrapper.contains(outputs, propName)) {
          throw new BaseException(
            `Output event '${propName}' defined multiple
              times in '${stringify(directiveType)}'`);
        }
      });
      mergedOutputs = ListWrapper.concat(dm.outputs, outputs);
    } else {
      mergedOutputs = outputs;
    }

    let mergedHost = isPresent(dm.host) ?
      StringMapWrapper.merge(dm.host, host) : host;
    let mergedQueries =
      isPresent(dm.queries) ?
        StringMapWrapper.merge(dm.queries, queries) : queries;

    if (dm instanceof ComponentMetadata) {
      return new ComponentMetadata({
        selector: dm.selector,
        inputs: mergedInputs,
        outputs: mergedOutputs,
        host: mergedHost,
        exportAs: dm.exportAs,
        moduleId: dm.moduleId,
        queries: mergedQueries,
        changeDetection: dm.changeDetection,
        providers: dm.providers,
        viewProviders: dm.viewProviders
      });

    } else {
      return new DirectiveMetadata({
        selector: dm.selector,
        inputs: mergedInputs,
        outputs: mergedOutputs,
        host: mergedHost,
        exportAs: dm.exportAs,
        queries: mergedQueries,
        providers: dm.providers
      });
    }
  }
}

export let CODEGEN_DIRECTIVE_RESOLVER = new DirectiveResolver();
