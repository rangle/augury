import {Injectable} from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import {
  MutableTree,
  Node,
  deserializePath,
} from '../../tree';

import {highlightTime} from '../../utils';

import {ParseUtils} from '../utils/parse-utils';

import {ExpandState} from './expand-state';

const checkReferenceId = (node: Node) => {
  if (node == null) {
    throw new Error('Node has no associated ID');
  }
};

@Injectable()
export class ComponentViewState {
  private subject = new Subject<void>();

  private expansion = new Map<string, ExpandState>();

  private changed = new Set<string>();

  private selected: string; // node path ID

  get changes(): Observable<void> {
    return this.subject.asObservable();
  }

  nodeIsChanged(node: Node) {
    return this.changed.has(node.id);
  }

  nodesChanged(identifiers: Array<string>) {
    for (const id of identifiers) {
      this.changed.add(id);
    }

    const remove = () => {
      for (const id of identifiers) {
        this.changed.delete(id);
      }

      this.subject.next(void 0);
    };

    setTimeout(() => remove(), highlightTime);
  }

  expandState(node: Node, expandState?: ExpandState) {
    checkReferenceId(node);

    if (expandState != null) {
      this.expansion.set(node.id, expandState);
      this.publish();
    }
    else {
      return this.expansion.get(node.id);
    }
  }

  selectionState(node: Node): boolean {
    return this.selected === node.id;
  }

  selectedTreeNode(tree: MutableTree): Node {
    if (this.selected == null) {
      return null;
    }

    const path = deserializePath(this.selected);

    return tree.traverse(path);
  }

  select(node: Node) {
    checkReferenceId(node);

    if (node) {
      const parseUtils = new ParseUtils();

      const path = deserializePath(node.id);

      // If this node is not even visible, we must expand its parents
      for (const parentId of parseUtils.getParentNodeIds(node.id)) {
        const collapsed = this.expansion.get(parentId) !== ExpandState.Expanded;
        if (collapsed) {
          this.expansion.set(parentId, ExpandState.Expanded);
        }
      }
    }

    this.selected = node.id;

    this.publish();
  }

  unselect() {
    this.selected = null;
    this.publish();
  }

  private publish() {
    this.subject.next(void 0);
  }
}
