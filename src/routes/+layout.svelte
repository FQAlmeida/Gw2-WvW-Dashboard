<script lang="ts">
    import TopAppBar, {
        Row,
        Section,
        Title,
        AutoAdjust,
    } from "@smui/top-app-bar";
    import IconButton, { Icon } from "@smui/icon-button";

    let topAppBar: TopAppBar;
    import Drawer, { AppContent, Content, Header } from "@smui/drawer";
    import List, { Item, Text, Graphic, Separator } from "@smui/list";
    import { mdiGithub, mdiChartLine } from "@mdi/js";
    import { Svg } from "@smui/common";

    let open = false;
</script>

<TopAppBar bind:this={topAppBar} variant="fixed" dense>
    <Row>
        <Section>
            <IconButton
                class="material-icons"
                on:click={() => (open = !open)}
                aria-label="menu"
            >
                menu
            </IconButton>
            <Title>Gw2 WvW Dashboard</Title>
        </Section>
        <Section align="end" toolbar>
            <IconButton
                class="material-icons"
                aria-label="github"
                size="normal"
                href="https://github.com/FQAlmeida/Gw2-WvW-Dashboard"
                target="_blank"
            >
                <Icon component={Svg} viewBox="0 0 24 24">
                    <path fill="currentColor" d={mdiGithub} />
                </Icon>
            </IconButton>
        </Section>
    </Row>
</TopAppBar>
<AutoAdjust {topAppBar}>
    <Drawer variant="dismissible" bind:open>
        <Header>
            <Row>
                <Section>
                    <Graphic class="material-icons">castle</Graphic>
                    <Title>Menu</Title>
                </Section>
            </Row>
        </Header>
        <Content>
            <Separator />
            <List>
                <Item href="javascript:void(0)">
                    <Graphic>
                        <Icon component={Svg} viewBox="0 0 24 24">
                            <path fill="currentColor" d={mdiChartLine} />
                        </Icon>
                    </Graphic>
                    <Text>Charts</Text>
                </Item>
            </List>
        </Content>
    </Drawer>
    <AppContent class="app-content">
        <main>
            <slot />
        </main>
    </AppContent>
</AutoAdjust>

<style>
    main {
        margin: 0 min(5vw, 5%);
        padding: min(3vh, 5%) 0;
    }
</style>
