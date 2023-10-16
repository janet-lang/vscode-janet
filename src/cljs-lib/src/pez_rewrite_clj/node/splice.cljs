(ns ^:no-doc pez-rewrite-clj.node.splice
  (:require [pez-rewrite-clj.node.protocols :as node]))

;; ## Node

(defrecord SpliceNode [children]
  node/Node
  (tag [_] :splice)
  (printable-only? [_] false)
  (sexpr [_]
    (throw (js/Error. "Unsupported operation for splicenode")))
  (length [_]
    (+ 1 (node/sum-lengths children)))
  (string [_]
    (str ";" (node/concat-strings children)))

  node/InnerNode
  (inner? [_] true)
  (children [_] children)
  (replace-children [this children']
    (node/assert-single-sexpr children')
    (assoc this :children children'))

  Object
  (toString [this]
    (node/string this)))

;(node/make-printable! UnevalNode)

;; ## Constructor

(defn splice-node
  "Create node representing a shorthand splice form (`;`)."
  [children]
  (if (sequential? children)
    (do
      (node/assert-single-sexpr children)
      (->SpliceNode children))
    (recur [children])))
