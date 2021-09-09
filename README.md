# SaaS Demo

## Setup

After clone:
```
cp base/.env.secrets.example base/.env.secrets
vi !$
# put in a random session secret
```

To start:
```
skaffold dev
```

## Notes

### Running migrations

```
kubectl exec demo-756459744f-nfhmh -- npx knex migrate:latest
```

### Installing a Package

```
kubectl exec demo-5f5694d86f-xzg8p -- npm install foo
kubectl cp demo-5f5694d86f-xzg8p:package.json /tmp/package.json
kubectl cp demo-5f5694d86f-xzg8p:package-lock.json /tmp/package-lock.json
cp /tmp/package.json /tmp/package-lock.json demo
# wait for rebuild...
```

## References

- https://github.com/arianitu/postgres-statefulset --- helpful example (but more than we need here)
- https://github.com/kubernetes-sigs/kustomize/blob/master/examples/components.md --- might be useful but seems a bit undocumented
- https://github.com/kubernetes-sigs/kustomize/blob/f61b075d3bd670b7bcd5d58ce13e88a6f25977f2/plugin/builtin/labeltransformer/LabelTransformer_test.go --- the label transformer does not seem to be documented anywhere...
